import EventsList from "@components/EventsList"
import EventsMap, { MapRefMethods } from "@components/EventsMap"
import { state } from "@components/MapTestData"
import EventDetails from "@screens/EventDetails/EventDetails"
import { EventMocks } from "@lib/events"
import EventTabBar from "@components/tabBarComponents/EventTabBar"
import React, { useRef } from "react"
import { ImageBackground, Text, TouchableOpacity, View } from "react-native"
import { Icon } from "react-native-elements"

const MARKER_SIZE = 80

const ActivitiesScreen = () => {
  const appRef = useRef<MapRefMethods | null>(null)
  const recenterThing = () => {
    appRef.current?.recenterToLocation(state.initialRegion)
  }
  return (
    <>
      <EventDetails event={EventMocks.PickupBasketball} />
    </>
  )
}

export default ActivitiesScreen
