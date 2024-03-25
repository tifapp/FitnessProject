import React, { useState } from "react"
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  LocationCoordinate2D,
  Region,
  minRegionMeterRadius,
  useRequestForegroundLocationPermissions,
  useUserCoordinatesQuery
} from "@location/index"
import {
  CurrentUserEvent,
  currentUserEventFromResponse
} from "@shared-models/Event"
import {
  ExploreEventsData,
  ExploreEventsInitialCenter,
  SAN_FRANCISCO_DEFAULT_REGION,
  createDefaultMapRegion,
  initialCenterToRegion
} from "./Models"
import { ExploreEventsMap } from "./Map"
import { useLastDefinedValue } from "@lib/utils/UseLastDefinedValue"
import { ExploreEventsBottomSheet } from "./BottomSheet"
import { BodyText, Title } from "@components/Text"
import { SkeletonEventCard } from "./SkeletonEventCard"
import { Ionicon } from "@components/common/Icons"
import { PrimaryButton } from "@components/Buttons"
import { ExploreEventsSearchBar } from "./SearchBar"
import { QueryHookOptions } from "@lib/ReactQuery"
import { eventDetailsQueryKey } from "@shared-models/query-keys/Event"
import { UseQueryResult, useQueryClient, useQuery } from "@tanstack/react-query"
import { PermissionResponse, LocationAccuracy } from "expo-location"
import { TiFAPI } from "@api-client/TiFAPI"

export const eventsByRegion = async (
  api: TiFAPI,
  region: Region,
  signal?: AbortSignal
) => {
  return (
    await api.exploreEvents(
      { latitude: region.latitude, longitude: region.longitude },
      minRegionMeterRadius(region),
      signal
    )
  ).data.events.map(currentUserEventFromResponse)
}

export type UseExploreEventsEnvironment = {
  fetchEvents: (
    region: Region,
    signal?: AbortSignal
  ) => Promise<CurrentUserEvent[]>
  isSignificantlyDifferentRegions: (r1: Region, r2: Region) => boolean
}

/**
 * A hook to provide the data and current region for the event exploration view.
 */
export const useExploreEvents = (
  initialCenter: ExploreEventsInitialCenter,
  { fetchEvents, isSignificantlyDifferentRegions }: UseExploreEventsEnvironment
) => {
  const { region, panToRegion } = useExploreEventsRegion(initialCenter)
  const { events, cancel } = useExploreEventsQuery(region!, fetchEvents, {
    enabled: !!region
  })
  return {
    region,
    data: eventsQueryToExploreEventsData(events),
    updateRegion: (newRegion: Region) => {
      if (!region) {
        panToRegion(newRegion)
      } else if (isSignificantlyDifferentRegions(region, newRegion)) {
        cancel()
        setTimeout(() => panToRegion(newRegion), 300)
      }
    }
  }
}

const eventsQueryToExploreEventsData = (
  query: UseQueryResult<CurrentUserEvent[], unknown>
): ExploreEventsData => {
  if (query.isLoading) {
    return { status: "loading" }
  } else if (query.isSuccess && query.data.length === 0) {
    return { status: "no-results", events: [] }
  } else if (query.isError) {
    return { status: "error", retry: query.refetch }
  }
  return { status: "success", events: query.data }
}

const useExploreEventsRegion = (initialCenter: ExploreEventsInitialCenter) => {
  const [pannedRegion, setPannedRegion] = useState(
    initialCenterToRegion(initialCenter)
  )
  const userRegion = useUserRegion({ enabled: !pannedRegion })
  const exploreRegion =
    userRegion === "loading"
      ? pannedRegion
      : pannedRegion ?? userRegion ?? SAN_FRANCISCO_DEFAULT_REGION
  return { region: exploreRegion, panToRegion: setPannedRegion }
}

type UserRegionResult = "loading" | (Region | undefined)

const useUserRegion = (
  options: QueryHookOptions<PermissionResponse>
): UserRegionResult => {
  const permissionQuery = useRequestForegroundLocationPermissions(options)
  const locationQuery = useUserCoordinatesQuery(
    { accuracy: LocationAccuracy.Balanced },
    {
      enabled: permissionQuery.data !== undefined
    }
  )
  if (permissionQuery.isFetching || locationQuery.isFetching) {
    return "loading"
  }
  const coords = locationQuery.data ? locationQuery.data?.coords : undefined
  return !coords
    ? undefined
    : createDefaultMapRegion({
        latitude: coords.latitude,
        longitude: coords.longitude
      })
}

const useExploreEventsQuery = (
  region: Region,
  fetchEvents: (
    region: Region,
    signal?: AbortSignal
  ) => Promise<CurrentUserEvent[]>,
  options: QueryHookOptions<CurrentUserEvent[]>
) => {
  const queryClient = useQueryClient()
  const queryKey = ["explore-events", region]
  return {
    events: useQuery(
      queryKey,
      async ({ signal }) => {
        const events = await fetchEvents(region, signal)

        events.forEach((event) => {
          queryClient.setQueryData(eventDetailsQueryKey(event.id), {
            status: "success",
            event
          })
        })

        return events
      },
      options
    ),
    cancel: () => {
      queryClient.cancelQueries({ queryKey })
    }
  }
}

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
      {region ? (
        <ExploreEventsMap
          initialRegion={region}
          onLongPress={onMapLongPress}
          onRegionChanged={onRegionUpdated}
          onEventSelected={onEventTapped}
          events={mapEventsData ?? []}
          style={styles.map}
        />
      ) : (
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