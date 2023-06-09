import { Headline } from "@components/Text"
import { Cancellable, cancelOnAborted } from "@lib/Cancellable"
import { CurrentUserEvent } from "@lib/events"
import { LocationCoordinate2D, Region } from "@lib/location"
import React, { useState } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { useQuery, useQueryClient } from "react-query"

export type ExploreEventsEnvironment = {
  fetchEvents: (region: Region) => Cancellable<CurrentUserEvent[]>
  isSignificantlyDifferentRegions: (r1: Region, r2: Region) => boolean
}

const createDefaultMapRegion = (coordinates: LocationCoordinate2D) => ({
  ...coordinates,
  latitudeDelta: 0.3,
  longitudeDelta: 0.3
})

export const useExploreEvents = (
  initialCenter: LocationCoordinate2D | undefined,
  { fetchEvents, isSignificantlyDifferentRegions }: ExploreEventsEnvironment
) => {
  const [region, setRegion] = useState(
    initialCenter ? createDefaultMapRegion(initialCenter) : undefined
  )
  const { events, cancel } = useExploreEventsQuery(region, fetchEvents)
  return {
    region,
    events,
    updateRegion: (newRegion: Region) => {
      if (!region) {
        setRegion(newRegion)
      } else if (isSignificantlyDifferentRegions(region!, newRegion)) {
        cancel()
        setTimeout(() => setRegion(newRegion), 300)
      }
    }
  }
}

const useExploreEventsQuery = (
  region: Region | undefined,
  fetchEvents: (region: Region) => Cancellable<CurrentUserEvent[]>
) => {
  const events = useQuery(
    ["explore-events", region],
    async ({ signal }) => {
      // NB: The signal is only undefined if the platform does not support the AbortController
      // api, but react-native added support in 0.60, so the force unwrap should be fine.
      return await cancelOnAborted(fetchEvents(region!), signal!).value
    },
    { enabled: !!region }
  )
  const queryClient = useQueryClient()
  return {
    events,
    cancel: () =>
      queryClient.cancelQueries({ queryKey: ["explore-events", region] })
  }
}

export type ExploreEventsProps = {
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsView = ({ style }: ExploreEventsProps) => (
  <Headline>TODO: Build the screen</Headline>
)
