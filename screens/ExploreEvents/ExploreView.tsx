import React from "react"
import { Headline } from "@components/Text"
import { StyleProp, ViewStyle } from "react-native"
import {
  LocationCoordinate2D,
  Region,
  isSignificantlyDifferentRegions
} from "@lib/location"
import { CurrentUserEvent } from "@lib/events"
import {
  ExploreEventsInitialCenter,
  SAN_FRANCISCO_DEFAULT_REGION
} from "./models"
import { useExploreEvents } from "./useExploreEvents"
import { Cancellable } from "@lib/Cancellable"
import { ExploreEventsMap } from "./Map"

export type ExploreEventsProps = {
  initialCenter: ExploreEventsInitialCenter
  onMapLongPress: (coordinate: LocationCoordinate2D) => void
  onEventTapped: (event: CurrentUserEvent) => void
  fetchEvents: (region: Region) => Cancellable<CurrentUserEvent[]>
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsView = ({
  initialCenter,
  fetchEvents,
  onMapLongPress,
  onEventTapped,
  style
}: ExploreEventsProps) => {
  const { region, events, updateRegion } = useExploreEvents(initialCenter, {
    fetchEvents,
    isSignificantlyDifferentRegions
  })

  if (!region) {
    return <Headline>Loading...</Headline>
  }

  return (
    <ExploreEventsMap
      initialRegion={region}
      onLongPress={onMapLongPress}
      onRegionChanged={updateRegion}
      onEventSelected={onEventTapped}
      events={events.data ?? []}
      style={style}
    />
  )
}
