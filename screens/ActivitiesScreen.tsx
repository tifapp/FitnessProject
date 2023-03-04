import { EventForm, EventFormToolbar } from "@components/eventForm"
import { dateRange } from "@lib/date"
import { EventColors } from "@lib/events/EventColors"
import { Auth } from "aws-amplify"
import React from "react"
import { Alert, Text, TouchableOpacity } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableOpacity onPress={signOut}>
        <Text
          style={{
            fontSize: 15,
            margin: 20
          }}
        >
          Log Out
        </Text>
        <Text
          style={{
            alignItems: "center",
            justifyContent: "center",
            color: "black",
            fontWeight: "bold",
            fontSize: 15
          }}
        >
          SandBox to get started
        </Text>
      </TouchableOpacity>
      <EventForm
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
        onDismiss={() => {}}
        onSubmit={async () => {}}
      >
        <EventFormToolbar />
      </EventForm>
    </GestureHandlerRootView>
  )
}

export default ActivitiesScreen
