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
  }
} as const

const presentErrorAlert = (key: keyof typeof HOST_PICKER_ERROR_ALERTS) => {
  Alert.alert(
    HOST_PICKER_ERROR_ALERTS[key].title,
    HOST_PICKER_ERROR_ALERTS[key].description
  )
}

export type UseEventHostPickerEnvironment = {
  promoteToHost: (attendeeID: UserID) => Promise<void>
  onSuccess: () => void
}

export const AttendeesListPicker = (
  attendeesListProps: UseAttendeesListProps,
  env: UseEventHostPickerEnvironment,
  style: StyleProp<ViewStyle>
) => {
  const { attendeesList, selectedAttendeeId, onAttendeeSelected } =
    useEventHostPicker(attendeesListProps, env)
  if (attendeesList.status === "success") {
    return (
      <View>
        <AttendeesListView
          renderAttendee={(attendee) => (
            <View>
              <TouchableOpacity
                onPress={() => onAttendeeSelected(attendee.id)}
                style={{
                  backgroundColor:
                    selectedAttendeeId === attendee.id ? "yellow" : "white"
                }}
              >
                <Subtitle> {attendee.username} </Subtitle>
                <BodyText> {attendee.handle.toString()} </BodyText>
              </TouchableOpacity>
            </View>
          )}
          attendeesList={attendeesList.attendeesList}
          refresh={attendeesList.refresh}
          isRefetching={attendeesList.isRefetching}
        ></AttendeesListView>
        <TouchableOpacity
          style={style}
          disabled={!selectedAttendeeId}
          onPress={() => console.log("Continue")}
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
    onSuccess: (_, attendeeID) => {
      if (attendeesList.status === "success") {
        updateAttendeesListQueryEvent(
          queryClient,
          attendeesListProps.eventId,
          (attendeeList) => attendeeList.swapHost(attendeeID)
        )
      }
      env.onSuccess()
    },
    onError: () => {
      setSelectedAttendeeId(undefined)
      presentErrorAlert("generic")
    }
  })

  return {
    attendeesList,
    selectedAttendeeId,
    onAttendeeSelected: (id: UserID) => setSelectedAttendeeId(id),
    submitted:
      selectedAttendeeId &&
      (() => hostPickerMutation.mutate(selectedAttendeeId))
  }
}
