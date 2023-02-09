import {Auth} from "aws-amplify"
import React from "react"
import { Alert, View } from "react-native"
import EventsList from "@components/EventsList"

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
    <View>
      <EventsList />
    </View>
  )
}

export default ActivitiesScreen
