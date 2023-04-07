import EventsList from "@components/EventsList"
import Map, { MapMarker } from "@components/Map"
import EventTabBar from "@components/tabBarComponents/EventTabBar"
import React from "react"
import { mapCompStyle, state } from "@components/MapTestData"
import { Text } from "react-native"
import { Circle } from "react-native-maps"

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
