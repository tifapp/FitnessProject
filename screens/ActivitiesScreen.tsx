import MapComponent from "@components/MapComponent"
import { mapCompStyle, state } from "@components/MapTestData"
import { EventColors } from "@lib/events/EventColors"
import { Auth } from "aws-amplify"
import React, { useState } from "react"
import { Alert, Button } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MapComponent
        mapStyle={mapCompStyle.container}
        initialRegion={state.initialRegion}
        initialRadius={{ radius: circleRadius }}
        currentSelectedMarker={selectedMarker}
        markers={state.markers}
        customizers={state.customizers}
        movementSettings={state.movementSettings}
      />
      <Button title={"Filler"} />
      <Button title={"Select 1"} onPress={() => setSelectedMarker("1")} />
      <Button title={"Select 2"} onPress={() => setSelectedMarker("2")} />
      <Button title={"Select 3"} onPress={() => setSelectedMarker("3")} />
      <Button title={"Select 4"} onPress={() => setSelectedMarker("4")} />
    </GestureHandlerRootView>
  )
}

export default ActivitiesScreen
