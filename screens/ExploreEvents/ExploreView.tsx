import { Headline } from "@components/Text"
import { UserLocationDependencyKeys } from "@hooks/UserLocation"
import { useDependencyValue } from "@lib/dependencies"
import { CurrentUserEvent } from "@lib/events"
import { LocationCoordinate2D, Region } from "@lib/location"
import React, { useState } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { useQuery } from "react-query"

export type ExploreEventsEnvironment = {
  fetchEvents: (region: Region) => Promise<CurrentUserEvent[]>
  isSignificantlyDifferentRegions: (r1: Region, r2: Region) => boolean
}

const createDefaultMapRegion = (coordinates: LocationCoordinate2D) => ({
  ...coordinates,
  latitudeDelta: 0.3,
  longitudeDelta: 0.3
})

export const useExploreEvents = (
  initialCenter: LocationCoordinate2D,
  { fetchEvents, isSignificantlyDifferentRegions }: ExploreEventsEnvironment
) => {
  const [region, setRegion] = useState(createDefaultMapRegion(initialCenter))
  return {
    events: useExploreEventsQuery(region, fetchEvents),
    regionUpdated: (newRegion: Region) => {
      if (isSignificantlyDifferentRegions(region, newRegion)) {
        setTimeout(() => setRegion(newRegion), 300)
      }
    }
  }
}

const useExploreEventsQuery = (
  center: Region,
  fetchEvents: (region: Region) => Promise<CurrentUserEvent[]>
) => {
  return useQuery(["explore-events", center], async () => {
    return await fetchEvents(center)
  })
}

export type ExploreEventsProps = {
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsView = ({ style }: ExploreEventsProps) => (
  <Headline>TODO: Build the screen</Headline>
)
