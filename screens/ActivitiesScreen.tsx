import React, { useState } from "react"
import EventsList from "@components/EventsList"
import Map from "@components/Map"
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
      <Map
        style={{ width: "100%", height: "100%" }}
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
</> */
export default ActivitiesScreen
