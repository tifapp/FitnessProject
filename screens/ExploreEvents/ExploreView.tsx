import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import {
  LocationCoordinate2D,
  Region,
  isSignificantlyDifferentRegions
} from "@lib/location"
import { CurrentUserEvent } from "@lib/events"
import { ExploreEventsInitialCenter } from "./models"
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

  return (
    <View style={style}>
      {region
        ? (
          <ExploreEventsMap
            initialRegion={region}
            onLongPress={onMapLongPress}
            onRegionChanged={updateRegion}
            onEventSelected={onEventTapped}
            events={events.data ?? []}
            style={styles.map}
          />
        )
        : (
          <Water />
        )}
    </View>
  )
}

const Water = () => (
  <View
    accessibilityLabel="Loading a map where you can explore nearby events in any area"
    style={styles.water}
  />
)

const styles = StyleSheet.create({
  water: {
    width: "100%",
    height: "100%",
    backgroundColor: "#a3bff4"
  },
  map: {
    width: "100%",
    height: "100%"
  }
})
