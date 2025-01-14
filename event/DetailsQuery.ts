import { QueryClient, UseQueryResult, useQuery } from "@tanstack/react-query"
import { EventID, EventWhenBlockedByHost } from "TiFShared/domain-models/Event"
import { ClientSideEvent, clientSideEventFromResponse } from "./ClientSideEvent"
import { useIsConnectedToInternet } from "@lib/InternetConnection"
import { featureContext } from "@lib/FeatureContext"
import { TiFAPI } from "TiFShared/api"

/**
 * A result from loading a single event for the details screen.
 */
export type EventDetailsLoadingResult =
  | { status: "not-found" | "cancelled" }
  | { status: "blocked"; event: EventWhenBlockedByHost }
  | { status: "success"; event: ClientSideEvent }

/**
 * Loads the event details from the server.
 *
 * A `clientReceivedTime` property is added on a successful response which is used for
 * calculating accurate countdown times.
 */
export const eventDetails = async (
  eventId: EventID,
  tifAPI: TiFAPI = TiFAPI.productionInstance
): Promise<EventDetailsLoadingResult> => {
  const resp = await tifAPI.eventDetails({ params: { eventId } })
  if (resp.status === 404) {
    return { status: "not-found" }
  } else if (resp.status === 403) {
    return { status: "blocked", event: resp.data }
  } else {
    return {
      status: "success",
      event: clientSideEventFromResponse(resp.data)
    }
  }
}

export const EventDetailsFeature = featureContext({ eventDetails })

export type UseLoadEventDetailsResult =
  | { status: "pending" | "not-found" | "cancelled" }
  | { status: "error"; retry: () => void; isConnectedToInternet: boolean }
  | {
      status: "success"
      refreshStatus: "pending" | "error" | "idle"
      event: ClientSideEvent
      refresh: () => void
    }
  | { status: "blocked"; event: EventWhenBlockedByHost }

/**
 * A hook to load an event in the context of the details screen.
 */
export const useLoadEventDetails = (
  eventId: EventID
): UseLoadEventDetailsResult => {
  const { eventDetails } = EventDetailsFeature.useContext()
  const query = useQuery({
    queryKey: eventDetailsQueryKey(eventId),
    queryFn: async () => await eventDetails(eventId)
  })
  return loadEventDetailsResult(query, useIsConnectedToInternet())
}

const loadEventDetailsResult = (
  query: UseQueryResult<EventDetailsLoadingResult, unknown>,
  isConnectedToInternet: boolean
) => {
  if (query.status === "error" && !query.isRefetchError) {
    return {
      status: query.status,
      isConnectedToInternet,
      retry: () => {
        query.refetch()
      }
    }
  } else if (query.status === "pending") {
    return { status: query.status }
  } else if (query.data.status !== "success") {
    return query.data
  } else {
    return {
      ...query.data,
      refresh: () => {
        query.refetch()
      },
      refreshStatus: refreshStatus(query)
    }
  }
}

const refreshStatus = (
  query: UseQueryResult<EventDetailsLoadingResult, unknown>
) => {
  if (query.isRefetching) {
    return "pending" as const
  } else if (query.isRefetchError) {
    return "error" as const
  } else {
    return "idle" as const
  }
}

const eventDetailsQueryKey = (eventId: EventID) => {
  return ["event", eventId] as const
}

/**
 * Updates the currently cached {@link ClientSideEvent} for the given event id
 * on the details screen. If no event is cached for the given id, or if the
 * underlying {@link EventDetailsLoadingResult} status is not `"success"`, then
 * the update function is not ran.
 */
export const updateEventDetailsQueryEvent = (
  queryClient: QueryClient,
  id: EventID,
  updateFn: (event: ClientSideEvent) => ClientSideEvent
) => {
  queryClient.setQueryData(
    eventDetailsQueryKey(id),
    (result: EventDetailsLoadingResult | undefined) => {
      if (!result || result.status !== "success") return result
      return { ...result, event: updateFn(result.event) }
    }
  )
}

export const setEventDetailsQueryEvent = (
  queryClient: QueryClient,
  event: ClientSideEvent
) => {
  queryClient.setQueryData(eventDetailsQueryKey(event.id), {
    status: "success",
    event
  })
}
