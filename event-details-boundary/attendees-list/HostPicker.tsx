import { BodyText, Subtitle } from "@components/Text"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { UserID } from "aws-sdk/clients/personalizeruntime"
import { useState } from "react"
import {
    Alert,
    StyleProp,
    TouchableOpacity,
    View,
    ViewStyle
} from "react-native"
import {
    AttendeesListView,
    UseAttendeesListProps,
    useAttendeesList
} from "./AttendeesList"
import { updateAttendeesListQueryEvent } from "./Query"

export const HOST_PICKER_ERROR_ALERTS = {
  generic: {
    title: "Uh-oh!",
    description: "Something went wrong. Please try again"
  },
  "user-not-attending": {
    title: "User",
    description: "Uh-oh, they're not here anymore"
  }
} as const

const presentErrorAlert = (key: keyof typeof HOST_PICKER_ERROR_ALERTS) => {
  Alert.alert(
    HOST_PICKER_ERROR_ALERTS[key].title,
    HOST_PICKER_ERROR_ALERTS[key].description
  )
}

export type PromoteToHostResult = "success" | "user-not-attending"

export type UseEventHostPickerEnvironment = {
  promoteToHost: (attendeeID: UserID) => Promise<PromoteToHostResult>
  onSuccess: () => void
}

export type EventHostPickerProps = {
  picker: ReturnType<typeof useEventHostPicker>
  style?: StyleProp<ViewStyle>
}

export const EventHostPickerView = ({
  picker,
  style
}: EventHostPickerProps) => {
  if (picker.attendeesList.status === "success") {
    return (
      <View>
        <AttendeesListView
          renderAttendee={(attendee) => (
            <View>
              <TouchableOpacity
                onPress={() => picker.onAttendeeSelected(attendee.id)}
                style={{
                  backgroundColor:
                    picker.selectedAttendeeId === attendee.id
                      ? "yellow"
                      : "white"
                }}
              >
                <Subtitle> {attendee.name} </Subtitle>
                <BodyText> {attendee.handle.toString()} </BodyText>
              </TouchableOpacity>
            </View>
          )}
          attendeesList={picker.attendeesList.attendeesList}
          refresh={picker.attendeesList.refresh}
          isRefetching={picker.attendeesList.isRefetching}
        />
        <TouchableOpacity
          style={style}
          disabled={!picker.selectedAttendeeId}
          onPress={() => {
            if (picker.submitted) {
              picker.submitted()
            }
          }}
        />
      </View>
    )
  }
}

export const useEventHostPicker = (
  attendeesListProps: UseAttendeesListProps,
  env: UseEventHostPickerEnvironment
) => {
  const queryClient = useQueryClient()
  const attendeesList = useAttendeesList(attendeesListProps)
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<
    UserID | undefined
  >()
  const hostPickerMutation = useMutation(env.promoteToHost, {
    onSuccess: (result, attendeeID) => {
      if (result === "user-not-attending") {
        setSelectedAttendeeId(undefined)
        updateAttendeesListQueryEvent(
          queryClient,
          attendeesListProps.eventId,
          (attendeeList) => attendeeList.removeAttendee(attendeeID)
        )
        presentErrorAlert("user-not-attending")
      } else {
        updateAttendeesListQueryEvent(
          queryClient,
          attendeesListProps.eventId,
          (attendeeList) => attendeeList.swapHost(attendeeID)
        )
        env.onSuccess()
      }
    },
    onError: () => {
      presentErrorAlert("generic")
    }
  })

  return {
    attendeesList,
    selectedAttendeeId,
    onAttendeeSelected: (id: UserID) => setSelectedAttendeeId(id),
    submitted:
      selectedAttendeeId &&
      !hostPickerMutation.isLoading &&
      (() => hostPickerMutation.mutate(selectedAttendeeId))
  }
}
