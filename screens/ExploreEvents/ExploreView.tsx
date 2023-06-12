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
import { useLastDefinedValue } from "@hooks/useLastDefinedValue"
import { ExploreEventsBottomSheet } from "./BottomSheet"
import { Title } from "@components/Text"
import { SkeletonEventCard } from "@components/eventCard/SkeletonEventCard"

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

  // NB: - Ensure the current events are still on the map when the
  // user pans to a new region
  const mapEventsData = useLastDefinedValue(events.data)

  return (
    <View style={style}>
      {region
        ? (
          <ExploreEventsMap
            initialRegion={region}
            onLongPress={onMapLongPress}
            onRegionChanged={updateRegion}
            onEventSelected={onEventTapped}
            events={mapEventsData ?? []}
            style={styles.map}
          />
        )
        : (
          <Water />
        )}
      <ExploreEventsBottomSheet
        onEventSelected={onEventTapped}
        events={events.data ?? []}
        HeaderComponent={
          <Title style={styles.sheetHeaderText}>
            {!events.isLoading ? "Nearby Events" : "Finding Nearby Events..."}
          </Title>
        }
        EmptyEventsComponent={<>{events.isLoading && <LoadingIndicator />}</>}
      />
    </View>
  )
}

const LoadingIndicator = () => (
  <View style={styles.horizontalSpacing}>
    <SkeletonEventCard style={styles.skeletonCardSpacing} />
    <SkeletonEventCard style={styles.skeletonCardSpacing} />
    <SkeletonEventCard style={styles.skeletonCardSpacing} />
  </View>
)

const Water = () => (
  <View
    accessibilityLabel="Loading a map where you can explore nearby events in any area"
    style={styles.water}
  />
)

const styles = StyleSheet.create({
  sheetHeaderText: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingBottom: 8
  },
  water: {
    width: "100%",
    height: "100%",
    backgroundColor: "#a3bff4"
  },
  map: {
    width: "100%",
    height: "100%"
  },
  horizontalSpacing: {
    paddingHorizontal: 24
  },
  skeletonCardSpacing: {
    paddingVertical: 12
  }
})
