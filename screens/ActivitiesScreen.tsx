import MapComponent from "@components/MapComponent"
import { mapCompStyle, state } from "@components/MapTestData"
import { EventColors } from "@lib/events/EventColors"
import { Auth } from "aws-amplify"
import React, { useState } from "react"
import { Alert } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"

const ActivitiesScreen = () => {
  const [color, setColor] = useState(EventColors.Red)
  const [circleRadius, setCircleRadius] = useState(1000)

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
      <MapComponent
        mapStyle={mapCompStyle.container}
        initialRegion={state.initialRegion}
        initialRadius={{ radius: circleRadius }}
        markers={state.markers}
        customizers={state.customizers}
        extractKey={(event) => event.key}
        movementSettings={state.movementSettings}
      />
    </GestureHandlerRootView>
  )
}

export default ActivitiesScreen
