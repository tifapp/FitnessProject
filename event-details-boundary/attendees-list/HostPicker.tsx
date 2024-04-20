import { BodyText, Subtitle } from "@components/Text"
import {
  InfiniteData,
  useMutation,
  useQueryClient
} from "@tanstack/react-query"
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
  EventAttendeesPage,
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
          attendees={attendeesList.attendees}
          totalAttendeeCount={attendeesList.totalAttendeeCount}
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
  const updateClientSideAttendeesList = (
    attendeesData: InfiniteData<EventAttendeesPage>,
    attendeeID: UserID
  ) => {
    const newHostIndex = attendeesData.pages[0].attendees.findIndex(
      (attendee) => attendee.id === attendeeID
    )
    const newAttendeesData = attendeesData
    if (newHostIndex !== -1) {
      newAttendeesData.pages[0].attendees.unshift(
        newAttendeesData.pages[0].attendees[newHostIndex]
      )
      newAttendeesData.pages[0].attendees.splice(newHostIndex + 1, 1)
    }
    return newAttendeesData
  }
  const hostPickerMutation = useMutation(env.promoteToHost, {
    onSuccess: (_, attendeeID) => {
      if (attendeesList.status === "success") {
        updateAttendeesListQueryEvent(
          queryClient,
          attendeesListProps.eventId,
          (attendeeList) =>
            updateClientSideAttendeesList(attendeeList, attendeeID)
        )
      }
      env.onSuccess()
    },
    onError: () => presentErrorAlert("generic")
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
