import MapComponent from "@components/MapComponent"
import { mapCompStyle, state } from "@components/MapTestData"
import React from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"

const ActivitiesScreen = () => {
  const circleRadius = 1000

  /* function signOut () {
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
  } */

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MapComponent
        containStyle={mapCompStyle.container}
        mapStyle={mapCompStyle.map}
        initialRegion={state.initialRegion}
        initialRadius={{ radius: circleRadius }}
        markers={state.markers}
        extractKey={(event) => event.key}
        movementSettings={state.movementSettings}
      />
    </GestureHandlerRootView>
  )
}

export default ActivitiesScreen
