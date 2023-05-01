import React from "react"
import EventDetails from "./EventDetails/EventDetails"
import { EventMocks } from "@lib/events"

const MARKER_SIZE = 80

const ActivitiesScreen = () => {
  return (
    <>
      <EventDetails event={EventMocks.NoPlacemarkInfo} />
    </>
  )
}

export default ActivitiesScreen
