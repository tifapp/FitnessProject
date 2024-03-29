import React from "react"
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LocationCoordinate2D, Region } from "@location/index"
import { CurrentUserEvent } from "@lib/events"
import { ExploreEventsData } from "./models"
import { ExploreEventsMap } from "./Map"
import { useLastDefinedValue } from "@lib/utils/UseLastDefinedValue"
import { ExploreEventsBottomSheet } from "./BottomSheet"
import { BodyText, Title } from "@components/Text"
import { SkeletonEventCard } from "@screens/ExploreEvents/SkeletonEventCard"
import { Ionicon } from "@components/common/Icons"
import { PrimaryButton } from "@components/Buttons"
import { ExploreEventsSearchBar } from "./SearchBar"

export type ExploreEventsProps = {
  searchText?: string
  region?: Region
  data: ExploreEventsData
  onRegionUpdated: (region: Region) => void
  onMapLongPress: (coordinate: LocationCoordinate2D) => void
  onEventTapped: (event: CurrentUserEvent) => void
  onSearchTapped: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * A view which allows users to interactively explore events in any given area.
 */
export const ExploreEventsView = ({
  searchText,
  region,
  data,
  onRegionUpdated,
  onMapLongPress,
  onEventTapped,
  onSearchTapped,
  style
}: ExploreEventsProps) => {
  const insets = useSafeAreaInsets()

  // NB: - Ensure the current events are still on the map when the
  // user pans to a new region
  const mapEventsData = useLastDefinedValue(data.events)

  return (
    <View style={[style, styles.container]}>
      {region
        ? (
          <ExploreEventsMap
            initialRegion={region}
            onLongPress={onMapLongPress}
            onRegionChanged={onRegionUpdated}
            onEventSelected={onEventTapped}
            events={mapEventsData ?? []}
            style={styles.map}
          />
        )
        : (
          <Water />
        )}
      <View style={[{ paddingTop: insets.top + 4 }, styles.searchBarContainer]}>
        <Pressable onPress={onSearchTapped} style={styles.searchBar}>
          <ExploreEventsSearchBar text={searchText} />
        </Pressable>
      </View>
      <ExploreEventsBottomSheet
        onEventSelected={onEventTapped}
        events={data.events ?? []}
        HeaderComponent={
          <Title style={styles.sheetHeaderText}>
            {data.status !== "loading"
              ? "Nearby Events"
              : "Finding Nearby Events..."}
          </Title>
        }
        EmptyEventsComponent={
          <View style={styles.emptyEventsContainer}>
            {data.status === "loading" && <LoadingView />}
            {data.status === "error" && <ErrorView onRetried={data.retry} />}
            {data.status === "no-results" && <NoResultsView />}
          </View>
        }
      />
    </View>
  )
}

type ErrorProps = {
  onRetried: () => void
}

const ErrorView = ({ onRetried }: ErrorProps) => (
  <View style={styles.emptyEventsContentContainer}>
    <Ionicon name="flame" size={48} style={styles.emptyEventsIcon} />
    <BodyText style={styles.emptyEventsText}>
      An error occurred, please try again.
    </BodyText>
    <PrimaryButton
      style={styles.tryAgainButton}
      title="Try Again"
      onPress={onRetried}
    />
  </View>
)

const NoResultsView = () => (
  <View style={styles.emptyEventsContentContainer}>
    <Ionicon name="map" size={48} style={styles.emptyEventsIcon} />
    <BodyText style={styles.emptyEventsText}>
      No events were found in this area. Try moving to a different location.
    </BodyText>
  </View>
)

const LoadingView = () => (
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
  container: {
    position: "relative"
  },
  sheetHeaderText: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
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
    paddingHorizontal: 16
  },
  skeletonCardSpacing: {
    paddingVertical: 12
  },
  emptyEventsContentContainer: {
    width: "100%",
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyEventsIcon: {
    opacity: 0.5
  },
  emptyEventsText: {
    marginTop: 8,
    textAlign: "center"
  },
  searchBarContainer: {
    position: "absolute",
    width: "100%"
  },
  searchBar: {
    paddingHorizontal: 16
  },
  tryAgainButton: {
    marginTop: 24,
    width: "100%"
  }
})
