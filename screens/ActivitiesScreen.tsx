import EventDetails from "@components/eventDetails/EventDetails"
import EventsList from "@components/EventsList"
import EventsMap, { MapRefMethods } from "@components/EventsMap"
import { state } from "@components/MapTestData"
import { TestEventItems } from "@lib/events"
import React, { useRef, useState } from "react"
import { Button } from "react-native"

const ActivitiesScreen = () => {
  const [selectedMarker, setSelectedMarker] = useState<String | undefined>("1")
  const startTime = new Date()
  const endTime = new Date()
  const appRef = useRef<MapRefMethods | null>(null)
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
  const recenterThing = () => {
    appRef.current?.recenterToLocation(state.initialRegion)
  }

  return (
    <>
      <Button title={"Recenter"} onPress={recenterThing} />
      <Button title={"Recenter"} onPress={recenterThing} />
      <EventsMap
        ref={appRef}
        style={{ width: "100%", height: "100%" }}
        initialRegion={state.initialRegion}
        markers={state.markers}
      />
      <EventsList />
      <EventDetails event={event} numAttendees={3} />
    </>
  )
}

export default ActivitiesScreen
