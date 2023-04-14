import EventsMap, { MapRefMethods } from "@components/EventsMap"
import { state } from "@components/MapTestData"
import React, { useRef } from "react"
import { Button } from "react-native"
import EventsList from "@components/EventsList"
import EventTabBar from "@components/tabBarComponents/EventTabBar"

const ActivitiesScreen = () => {
  const appRef = useRef<MapRefMethods | null>(null)
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
        renderMarker={(item) => null}
        markers={state.markers}
      />
      <EventsList />
      <EventTabBar />
    </>
  )
}

export default ActivitiesScreen
