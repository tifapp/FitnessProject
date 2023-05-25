import { CurrentUserEvent } from "@lib/events"
import { LocationCoordinate2D } from "@lib/location"
import React, { useState } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { useQuery } from "react-query"

export const useExploreEvents = (
  fetchEvents: (center: LocationCoordinate2D) => Promise<CurrentUserEvent[]>
) => {
  const [center, setCenter] = useState<LocationCoordinate2D | undefined>()
  const events = useQuery(
    ["explore-events", center],
    async () => await fetchEvents(center!),
    { enabled: !!center }
  )
  return {
    events,
    regionUpdated: setCenter
  }
}

export type ExploreEventsProps = {
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsView = ({ style }: ExploreEventsProps) => <></>
