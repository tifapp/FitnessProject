import EventsList from "@components/EventsList"
import Map from "@components/Map"
import { mapCompStyle, state } from "@components/MapTestData"
import { Auth } from "aws-amplify"
import React, { useState } from "react"
import { Alert, Text } from "react-native"
import { Circle } from "react-native-maps"

const ActivitiesScreen = () => {
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
    <>
      <Map
        mapStyle={mapCompStyle.container}
        initialRegion={state.initialRegion}
        renderMarker={(item) => <Text> Lesgoo </Text>}
        renderCircle={(item) => (
          <Circle
            radius={1000}
            center={{
              latitude: item.location.latitude,
              longitude: item.location.longitude
            }}
            fillColor={"rgba(0, 0, 0, 0.5)"}
            strokeColor={"gray"}
            strokeWidth={1}
          />
        )}
        markers={state.markers}
      />
      <EventsList />
    </>
  )
}

export default ActivitiesScreen
