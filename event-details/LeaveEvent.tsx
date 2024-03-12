import { CurrentUserEvent } from "@shared-models/Event"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert } from "react-native"

export const LEAVE_EVENT_ERROR_ALERTS = {
  eventHasEnded: {
    title: "Event has ended",
    description: "This event has ended. You will be moved to the previous screen."
  },
  eventWasCancelled: {
    title: "Event was cancelled",
    description: "This event was cancelled. You will be moved to the previous screen."
  },
  coHostNotFound: {
    title: "Event has no co-host",
    description: "This event has no co-host. To leave, you will need to select a new host."
  },
  generic: {
    title: "Uh-oh!",
    description: "Something went wrong. Please try again"
  }
}

const presentErrorAlert = (key: keyof typeof LEAVE_EVENT_ERROR_ALERTS) => {
  Alert.alert(
    LEAVE_EVENT_ERROR_ALERTS[key].title,
    LEAVE_EVENT_ERROR_ALERTS[key].description
  )
}

export type LeaveEventResult = "success" | "eventHasEnded" | "eventWasCancelled" | "coHostNotFound"

export type UseLeaveEventEnvironment = {
  leaveEvent: (eventId: number) => Promise<LeaveEventResult>
  onSuccess: () => void
}

export type UseLeaveEventMenu = {
  attendeeStatus: "hosting",
  isLoading: boolean,
  deleteButtonTapped: () => void,
  reselectButtonTapped: () => void,
} | { attendeeStatus: "attending",
  isLoading: boolean
  confirmButtonTapped: () => void
}

export type UseLeaveEventStatus =
  | { status: "success" }
  | ({ status: "select" } & UseLeaveEventMenu)
  | undefined

export const useLeaveEvent = (event: Pick<CurrentUserEvent, "id" | "userAttendeeStatus">, env: UseLeaveEventEnvironment): UseLeaveEventStatus => {
  const queryClient = useQueryClient()
  const { onSuccess, leaveEvent } = env
  const leaveEventMutation = useMutation(
    async () => await leaveEvent(event.id),
    {
      onSuccess: (status) => {
        if (status !== "success") presentErrorAlert(status)
        onSuccess()
        queryClient.setQueryData(["event", event.id], event)
      },
      onError: () => presentErrorAlert("generic")
    }
  )

  const isSuccess =
    leaveEventMutation.isSuccess && leaveEventMutation.data === "success"

  if (isSuccess) {
    return { status: "success" }
  } else if (event.userAttendeeStatus === "attending") {
    return {
      status: "select",
      isLoading: leaveEventMutation.isLoading,
      attendeeStatus: event.userAttendeeStatus,
      confirmButtonTapped: () => {
        leaveEventMutation.mutate()
      }
    }
  } else if (event.userAttendeeStatus === "hosting") {
    return {
      status: "select",
      isLoading: leaveEventMutation.isLoading,
      attendeeStatus: event.userAttendeeStatus,
      deleteButtonTapped: () => {
        Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
          {
            text: "Delete",
            style: "destructive",
            onPress: () => leaveEventMutation.mutate()
          },
          {
            text: "Cancel",
            style: "cancel"
          }])
      },
      reselectButtonTapped: () => console.log("Reselect")
    }
  }
}
