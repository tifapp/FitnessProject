import { CurrentUserEvent, EventWhenBlockedByHost } from "@shared-models/Event"
import { eventDetailsQueryKey } from "@shared-models/query-keys/Event"
import { QueryClient, useQuery } from "@tanstack/react-query"
import { EventID } from "TiFShared/domain-models/Event"

/**
 * A result from loading a single event for the details screen.
 */
export type EventDetailsLoadingResult =
  | { status: "not-found" | "cancelled" }
  | { status: "blocked"; event: EventWhenBlockedByHost }
  | { status: "success"; event: CurrentUserEvent }

export const useEventDetailsQuery = (
  id: EventID,
  loadEvent: (id: EventID) => Promise<EventDetailsLoadingResult>
) => {
  return useQuery(eventDetailsQueryKey(id), async () => await loadEvent(id))
}

/**
 * Updates the currently cached {@link CurrentUserEvent} for the given event id
 * on the details screen. If no event is cached for the given id, or if the
 * underlying {@link EventDetailsLoadingResult} status is not `"success"`, then
 * the update function is not ran.
 */
export const updateEventDetailsQueryEvent = (
  queryClient: QueryClient,
  id: EventID,
  updateFn: (event: CurrentUserEvent) => CurrentUserEvent
) => {
  queryClient.setQueryData(
    eventDetailsQueryKey(id),
    (result: EventDetailsLoadingResult | undefined) => {
      if (!result || result.status !== "success") return result
      return { ...result, event: updateFn(result.event) }
    }
  )
}
