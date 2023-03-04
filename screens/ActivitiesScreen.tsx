import { EventForm, EventFormToolbar } from "@components/eventForm"
import { dateRange } from "@lib/date"
import { EventColors } from "@lib/events/EventColors"
import { Auth } from "aws-amplify"
import React from "react"
import { Alert, Text, TouchableOpacity } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import EventFormScreen from "./EventFormScreen"

const ActivitiesScreen = () => {
  function signOut () {
    const title = "Are you sure you want to sign out?"
    const message = ""
    Alert.alert(
      title,
      message,
      [
        {
          text: "Yes",
          onPress: () => {
            Auth.signOut()
          }
        }, // if submithandler fails user won't know
        { text: "Cancel", style: "cancel" }
      ],
      { cancelable: true }
    )
  }

  return (
    <EventFormScreen
      initialValues={{
        title: "Test",
        description: "Hello world this is a test.",
        color: EventColors.Red,
        dateRange: dateRange(
          new Date("2023-03-02T08:00:00"),
          new Date("2023-03-02T09:00:00")
        ),
        radiusMeters: 0,
        shouldHideAfterStartDate: false
      }}
      submissionLabel="Save Event"
      onDismiss={() => {}}
      onSubmit={async () => {}}
    />
  )
}

export default ActivitiesScreen
