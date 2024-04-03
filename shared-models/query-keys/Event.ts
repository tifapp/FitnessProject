import { EventID } from "@shared-models/Event"

export const eventDetailsQueryKey = (eventId: EventID) => {
  return ["event", eventId] as const
}

export const eventAttendeesListQueryKey = (eventId: EventID) => {
  return ["attendees", eventId] as const
}
