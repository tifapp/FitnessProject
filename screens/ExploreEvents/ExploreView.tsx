import { Headline } from "@components/Text"
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
  const events = useQuery(["explore-events", initialCenter], async () => {
    await fetchEvents({
      ...initialCenter!,
      latitudeDelta: 0,
      longitudeDelta: 0
    })
  })
  return {
    events
  }
}

export type ExploreEventsProps = {
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsView = ({ style }: ExploreEventsProps) => (
  <Headline>TODO: Build the screen</Headline>
)
