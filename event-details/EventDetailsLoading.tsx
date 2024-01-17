import { UseQueryResult, useQuery } from "@tanstack/react-query"
import { BlockedEvent, CurrentUserEvent } from "@shared-models/Event"
import { useIsConnectedToInternet } from "@lib/InternetConnection"
import { useEffect } from "react"
import { useEffectEvent } from "@lib/utils/UseEffectEvent"
import { TiFAPI } from "@api-client/TiFAPI"

/**
 * A result from loading a single event for the details screen.
 */
export type EventDetailsLoadingResult =
  | { status: "not-found" | "cancelled" }
  | { status: "blocked"; event: BlockedEvent }
  | { status: "success"; event: CurrentUserEvent }

/**
 * Loads the event details from the server.
 *
 * A `clientReceivedTime` property is added on a successful response which is used for
 * calculating accurate countdown times.
 */
export const loadEventDetails = async (
  eventId: number,
  tifAPI: TiFAPI
): Promise<EventDetailsLoadingResult> => {
  const resp = await tifAPI.eventDetails(eventId)
  if (resp.status === 404) {
    return { status: "not-found" }
  } else if (resp.status === 403) {
    return { status: "blocked", event: resp.data }
  } else if (resp.status === 204) {
    return { status: "cancelled" }
  } else {
    return {
      status: "success",
      event: {
        ...resp.data,
        time: { ...resp.data.time, clientReceivedTime: new Date() }
      }
    }
  }
}

export type UseLoadEventDetailsResult =
  | { status: "loading" | "not-found" | "cancelled" }
  | { status: "error"; retry: () => void; isConnectedToInternet: boolean }
  | {
      status: "success"
      refreshStatus: "loading" | "error" | "idle"
      event: CurrentUserEvent
      refresh: () => void
    }
  | { status: "blocked"; event: BlockedEvent }

/**
 * A hook to load an event in the context of the details screen.
 */
export const useLoadEventDetails = (
  eventId: number,
  loadEvent: (id: number) => Promise<EventDetailsLoadingResult>
): UseLoadEventDetailsResult => {
  const query = useQuery(
    ["event", eventId],
    async () => await loadEvent(eventId)
  )
  const isConnectedToInternet = useIsConnectedToInternet()
  const refetchIfInErrorState = useEffectEvent(() => {
    if (query.status === "error") {
      query.refetch()
    }
  })
  useEffect(() => {
    if (isConnectedToInternet) {
      refetchIfInErrorState()
    }
  }, [refetchIfInErrorState, isConnectedToInternet])
  return loadEventDetailsResult(query, isConnectedToInternet)
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
  } else if (query.status === "loading") {
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
    return "loading" as const
  } else if (query.isRefetchError) {
    return "error" as const
  } else {
    return "idle" as const
  }
}
