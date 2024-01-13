import { DefinedQueryObserverResult, useQuery } from "@tanstack/react-query"
import { BlockedEvent, CurrentUserEvent } from "./Event"

export type EventLoadingResult =
  | { status: "not-found" | "deleted" }
  | { status: "blocked"; event: BlockedEvent }
  | { status: "success"; event: CurrentUserEvent }

export type UseLoadEventResult =
  | { status: "loading" | "not-found" | "deleted" }
  | { status: "error"; retry: () => void }
  | {
      status: "success"
      // eslint-disable-next-line no-use-before-define
      refreshStatus: ReturnType<typeof refreshStatus>
      event: CurrentUserEvent
      refresh: () => void
    }
  | { status: "blocked"; event: BlockedEvent }

export const useLoadEvent = (
  eventId: number,
  loadEvent: (id: number) => Promise<EventLoadingResult>
): UseLoadEventResult => {
  const query = useQuery(
    ["event", eventId],
    async () => await loadEvent(eventId)
  )
  if (query.status === "error") {
    return {
      status: "error",
      retry: () => {
        query.refetch()
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
        query.refetch()
      },
      refreshStatus: refreshStatus(query)
    } as const
  }
}

const refreshStatus = (
  query: DefinedQueryObserverResult<EventLoadingResult, unknown>
) => {
  if (query.isRefetching) {
    return "loading" as const
  } else if (query.isRefetchError) {
    return "error" as const
  } else {
    return "idle" as const
  }
}
