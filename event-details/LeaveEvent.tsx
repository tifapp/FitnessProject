import { CurrentUserEvent, EventAttendee, EventLocation } from "@shared-models/Event"
import { Alert } from "react-native"
import { JOIN_EVENT_ERROR_ALERTS } from "./JoinEvent"

export const LEAVE_EVENT_ERROR_ALERTS = {
  generic: {
    title: "Uh-oh!",
    description: "Something went wrong. Please try again"
  }
}

const presentErrorAlert = (key: keyof typeof JOIN_EVENT_ERROR_ALERTS) => {
  Alert.alert(
    JOIN_EVENT_ERROR_ALERTS[key].title,
    JOIN_EVENT_ERROR_ALERTS[key].description
  )
}

export const useLeaveEvent = (leaveEvent: (event: Pick<CurrentUserEvent, "id">, attendee: EventAttendee) => Object, event: CurrentUserEvent, attendee: EventAttendee) => {
  return leaveEvent(event, attendee)
}
