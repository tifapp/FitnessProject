import { UseQueryResult, useQuery } from "@tanstack/react-query"
import { BlockedEvent, CurrentUserEvent } from "./Event"
import { useIsConnectedToInternet } from "@lib/InternetConnection"
import { useEffect } from "react"

/**
 * A result from loading a single event for the details screen.
 */
export type EventDetailsLoadingResult =
  | { status: "not-found" | "deleted" }
  | { status: "blocked"; event: BlockedEvent }
  | { status: "success"; event: CurrentUserEvent }

export type UseLoadEventDetailsResult =
  | { status: "loading" | "not-found" | "deleted" }
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
  const refetch = query.refetch
  const isConnectedToInternet = useIsConnectedToInternet()
  useEffect(() => {
    if (isConnectedToInternet) {
      refetch()
    }
  }, [refetch, isConnectedToInternet])
  if (query.status === "error" && !query.isRefetchError) {
    return {
      status: "error",
      isConnectedToInternet,
      retry: () => {
        refetch()
      }
    } as const
  } else if (query.status === "loading") {
    return { status: query.status }
  } else if (query.data.status !== "success") {
    return query.data
  } else {
    return {
      ...query.data,
      refresh: () => {
        refetch()
      },
      refreshStatus: refreshStatus(query)
    } as const
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
