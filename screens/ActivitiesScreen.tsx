import MapComponent from "@components/MapComponent"
import { mapCompStyle, state } from "@components/MapTestData"
import { Auth } from "aws-amplify"
import EventsList from "@components/EventsList"
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
      <MapComponent
        containStyle={mapCompStyle.container}
        mapStyle={mapCompStyle.map}
        initialRegion={state.initialRegion}
        markers={state.markers}
        extractKey={(event) => event.key}
        movementSettings={state.movementSettings}
      />
      <EventsList />
    </GestureHandlerRootView>
  )
}

export default ActivitiesScreen
