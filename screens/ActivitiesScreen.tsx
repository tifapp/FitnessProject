import { EventColors } from "@lib/events/EventColors"
import { Auth } from "aws-amplify"
import React, { useState } from "react"
import { Alert } from "react-native"
import { QueryClient } from "react-query"
import { EventFormTestScreen } from "./testScreens/EventFormTestScreen"

const queryClient = new QueryClient()

const ActivitiesScreen = () => {
  const [color, setColor] = useState(EventColors.Red)
  const [circleRadius, setCircleRadius] = useState(100)
  const [selectedMarker, setSelectedMarker] = useState<String | undefined>("1")

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

  return <EventFormTestScreen />
}

export default ActivitiesScreen
