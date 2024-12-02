import { ClientSideEvent } from "@event/ClientSideEvent"
import { updateEventDetailsQueryEvent } from "@event/DetailsQuery"
import { AlertsObject, presentAlert } from "@lib/Alerts"
import { useFormSubmission } from "@lib/utils/Form"
import { useQueryClient } from "@tanstack/react-query"
import { TiFAPI } from "TiFShared/api"
import { EventID } from "TiFShared/domain-models/Event"

export const leaveEvent = async (
  id: EventID,
  api: TiFAPI = TiFAPI.productionInstance
): Promise<LeaveEventResult> => {
  const resp = await api.leaveEvent({ params: { eventId: id } })
  if (resp.status === 204 || resp.status === 200) return "success"
  return resp.data.error
}

export const ALERTS = {
  "event-has-ended": {
    title: "Event has ended",
    description:
      "This event has ended. You will be moved to the previous screen."
  },
  "event-was-cancelled": {
    title: "Event was cancelled",
    description:
      "This event was cancelled. You will be moved to the previous screen."
  },
  "event-not-found": {
    title: "Event not Found",
    description: "It seems that this event does not exist."
  },
  genericError: {
    title: "Uh-oh!",
    description: "Something went wrong. Please try again"
  },
  confirmLeaveHost: (attendeeCount: number, onLeave?: () => void) => ({
    title: "Leave this Event?",
    description: `Are you sure about leaving the event? ${attendeeCount > 1 ? "The new host will be the person who first joined the event after you." : "Leaving will delete the event."}.`,
    buttons: [
      { text: "Cancel" },
      { text: "Leave", style: "destructive", onPress: onLeave }
    ]
  }),
  confirmLeaveAttendee: (
    host: ClientSideEvent["host"],
    onLeave?: () => void
  ) => ({
    title: "Leave this Event?",
    description: `Are you sure about leaving the event? ${host.name} (${host.handle}) would like you to stay if possible.`,
    buttons: [
      { text: "Cancel" },
      { text: "Leave", style: "destructive", onPress: onLeave }
    ]
  })
} satisfies AlertsObject

export type LeaveEventResult =
  | "success"
  | "event-has-ended"
  | "event-not-found"
  | "event-was-cancelled"

export type UseLeaveEventEnvironment = {
  leaveEvent: (eventId: number) => Promise<LeaveEventResult>
  onSuccess: () => void
}

export const useLeaveEvent = (
  event: Pick<
    ClientSideEvent,
    "id" | "userAttendeeStatus" | "host" | "attendeeCount"
  >,
  { leaveEvent, onSuccess }: UseLeaveEventEnvironment
) => {
  const queryClient = useQueryClient()
  const submission = useFormSubmission(
    (id: EventID) => leaveEvent(id),
    () => {
      if (event.userAttendeeStatus === "not-participating") {
        return { status: "invalid" }
      }
      return { status: "submittable", submissionValues: event.id }
    },
    {
      onSuccess: (status) => {
        if (status === "success") {
          onSuccess()
          updateEventDetailsQueryEvent(queryClient, event.id, (e) => ({
            ...e,
            userAttendeeStatus: "not-participating"
          }))
        } else {
          presentAlert(ALERTS[status])
        }
      },
      onError: () => presentAlert(ALERTS.genericError)
    }
  )
  return {
    leaveStarted:
      submission.status === "submittable"
        ? () => {
            if (event.userAttendeeStatus === "attending") {
              presentAlert(
                ALERTS.confirmLeaveAttendee(event.host, submission.submit)
              )
            } else {
              presentAlert(
                ALERTS.confirmLeaveHost(event.attendeeCount, submission.submit)
              )
            }
          }
        : undefined
  }
}
