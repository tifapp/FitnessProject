import { BlockedEvent, CurrentUserEvent, EventID } from "@shared-models/Event"
import { eventDetailsQueryKey } from "@shared-models/query-keys/Event"
import { useQuery } from "@tanstack/react-query"

/**
 * A result from loading a single event for the details screen.
 */
export type EventDetailsLoadingResult =
  | { status: "not-found" | "cancelled" }
  | { status: "blocked"; event: BlockedEvent }
  | { status: "success"; event: CurrentUserEvent }

export const useEventDetailsQuery = (
  id: EventID,
  loadEvent: (id: EventID) => Promise<EventDetailsLoadingResult>
) => {
  return useQuery(eventDetailsQueryKey(id), async () => await loadEvent(id))
}
