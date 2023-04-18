import EventsList from "@components/EventsList"
import Map from "@components/Map"
import EventTabBar from "@components/tabBarComponents/EventTabBar"
import React from "react"
import { state } from "@components/MapTestData"
import EventDetails from "@components/eventDetails/EventDetails"
import { EventMocks } from "@lib/events"

const ActivitiesScreen = () => {
  return (
    <>
      <EventDetails event={EventMocks.PickupBasketball} />
    </>
  )
}

export default ActivitiesScreen
