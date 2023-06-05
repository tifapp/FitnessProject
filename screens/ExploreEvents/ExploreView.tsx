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
}

export const useExploreEvents = (
  initialCenter: LocationCoordinate2D | undefined,
  { fetchEvents }: ExploreEventsEnvironment
) => {
  return {
    events: useExploreEventsQuery(initialCenter, fetchEvents)
  }
}

const useExploreEventsQuery = (
  center: LocationCoordinate2D | undefined,
  fetchEvents: (region: Region) => Promise<CurrentUserEvent[]>
) => {
  const queryUserCoordinates = useDependencyValue(
    UserLocationDependencyKeys.currentCoordinates
  )
  return useQuery(["explore-events", center], async () => {
    const fetchCenter =
      center ?? (await queryUserCoordinates("approximate-low")).coordinates
    return await fetchEvents({
      ...fetchCenter,
      latitudeDelta: 0,
      longitudeDelta: 0
    })
  })
}

export type ExploreEventsProps = {
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsView = ({ style }: ExploreEventsProps) => (
  <Headline>TODO: Build the screen</Headline>
)
