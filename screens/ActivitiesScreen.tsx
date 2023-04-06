import EventsList from "@components/EventsList"
import Map, { MapMarker } from "@components/Map"
import EventFooter from "@components/eventFooterComponents/EventFooter"
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
      <EventFooter />
    </>
  )
}

export default ActivitiesScreen
