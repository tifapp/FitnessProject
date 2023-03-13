import EventsList from "@components/EventsList"
import MapComponent from "@components/MapComponent"
import { mapCompStyle, state } from "@components/MapTestData"
import React, { useState } from "react"

const ActivitiesScreen = () => {
  const [circleRadius, setCircleRadius] = useState(100)
  const [selectedMarker, setSelectedMarker] = useState<String | undefined>("1")

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
    <>
      <MapComponent
        mapStyle={mapCompStyle.container}
        initialRegion={state.initialRegion}
        initialRadius={{ radius: circleRadius }}
        currentSelectedMarker={selectedMarker}
        markers={state.markers}
        customizers={state.customizers}
        movementSettings={state.movementSettings}
      />
      <EventsList />
    </>
  )
}

export default ActivitiesScreen
