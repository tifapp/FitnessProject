import { EventID } from "TiFShared/domain-models/Event"

export const eventDetailsQueryKey = (eventId: EventID) => {
  return ["event", eventId] as const
}
