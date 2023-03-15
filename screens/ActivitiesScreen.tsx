import React, { useState } from "react"
import EventsList from "@components/EventsList"
import MapComponent from "@components/MapComponent"
import { mapCompStyle, state } from "@components/MapTestData"
import EventDetails from "@components/eventDetails/EventDetails"
import { TestEventItems } from "@lib/events"

const ActivitiesScreen = () => {
  const [circleRadius, setCircleRadius] = useState(100)
  const [selectedMarker, setSelectedMarker] = useState<String | undefined>("1")
  const startTime = new Date()
  const endTime = new Date()
  endTime.setDate(endTime.getDate() + 2)
  endTime.setHours(endTime.getHours() + 2)
  const event = TestEventItems.mockEvent(startTime, endTime, true, "3")
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

  return <EventDetails event={event} numAttendees={3} />
}
/*
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
</> */
export default ActivitiesScreen
