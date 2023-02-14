import { Auth } from "aws-amplify"
import React from "react"
import { Alert, View } from "react-native"
import EventsList from "@components/EventsList"
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
      <EventsList />
    </GestureHandlerRootView>
  )
}

export default ActivitiesScreen
