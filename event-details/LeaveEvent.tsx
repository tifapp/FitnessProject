import { CurrentUserEvent } from "@shared-models/Event"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
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
  leaveEvent: (event: Pick<CurrentUserEvent, "id" | "userAttendeeStatus">) => Promise<LeaveEventResult>
  onSuccess: () => void
}

export type UseLeaveEventStage = {
  attendeeStatus: "hosting"
  deleteButtonTapped: () => void,
  reselectButtonTapped: () => void,
  dismissButtonTapped: () => void
} | { attendeeStatus: "attending"
  confirmButtonTapped: () => void
  dismissButtonTapped: () => void
} | { attendeeStatus: "not-participating"}

export type UseLeaveEventStatus =
  | { status: "idle"; leaveButtonTapped: () => void }
  | { status: "loading" | "success" }
  | ({ status: "select" } & UseLeaveEventStage)

export const useLeaveEvent = (event: Pick<CurrentUserEvent, "id" | "userAttendeeStatus">, env: UseLeaveEventEnvironment): UseLeaveEventStatus => {
  const { onSuccess, leaveEvent } = env
  const [isModalOpen, setIsModalOpen] = useState(false)
  const leaveEventMutation = useMutation(
    async () => await leaveEvent(event),
    {
      onSuccess: (status) => {
        if (status !== "success") presentErrorAlert(status)
        onSuccess()
      },
      onError: () => presentErrorAlert("generic")
    }
  )

  const startSelectionFlow = () => {
    setIsModalOpen(true)
  }

  const endSelectionFlow = () => {
    setIsModalOpen(false)
  }

  const isSuccess =
    leaveEventMutation.isSuccess && leaveEventMutation.data === "success"

  if (isSuccess) {
    return { status: "success" }
  } else if (
    leaveEventMutation.isLoading
  ) {
    return { status: "loading" }
  } else if (isModalOpen && event.userAttendeeStatus === "attending") {
    return {
      status: "select",
      attendeeStatus: event.userAttendeeStatus,
      confirmButtonTapped: leaveEventMutation.mutate,
      dismissButtonTapped: () => endSelectionFlow()
    }
  } else if (isModalOpen && event.userAttendeeStatus === "hosting") {
    return {
      status: "select",
      attendeeStatus: event.userAttendeeStatus,
      deleteButtonTapped: () => {
        endSelectionFlow(); Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
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
      reselectButtonTapped: () => console.log("Reselect"),
      dismissButtonTapped: () => endSelectionFlow()
    }
  } else {
    return { status: "idle", leaveButtonTapped: () => startSelectionFlow() }
  }
}
