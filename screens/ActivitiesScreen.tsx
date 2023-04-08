import EventsList from "@components/EventsList"
import Map from "@components/Map"
import EventTabBar from "@components/tabBarComponents/EventTabBar"
import React from "react"
import { state } from "@components/MapTestData"

const ActivitiesScreen = () => {
  return (
    <>
      <Map
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
