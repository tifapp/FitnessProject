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
import { BodyText, Headline, Title } from "@components/Text"
import { SkeletonEventCard } from "@components/eventCard/SkeletonEventCard"
import { Ionicon } from "@components/common/Icons"

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
        EmptyEventsComponent={
          <View style={styles.emptyEventsContainer}>
            {events.isLoading && <LoadingIndicator />}
            {events.isError && <Headline>Lol</Headline>}
            {events.isSuccess && events.data.length === 0 && <NoResultsView />}
          </View>
        }
      />
    </View>
  )
}

const NoResultsView = () => (
  <View style={styles.noResultsContainer}>
    <Ionicon name="map" size={48} style={styles.noResultsIcon} />
    <BodyText style={styles.noResultsText}>
      No events were found in this area. Try moving to a different location.
    </BodyText>
  </View>
)

const LoadingIndicator = () => (
  <>
    <SkeletonEventCard style={styles.skeletonCardSpacing} />
    <SkeletonEventCard style={styles.skeletonCardSpacing} />
    <SkeletonEventCard style={styles.skeletonCardSpacing} />
  </>
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
  emptyEventsContainer: {
    paddingHorizontal: 24,
    flex: 1
  },
  skeletonCardSpacing: {
    paddingVertical: 12
  },
  noResultsContainer: {
    width: "100%",
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  noResultsIcon: {
    opacity: 0.5
  },
  noResultsText: {
    marginTop: 16,
    textAlign: "center"
  }
})
