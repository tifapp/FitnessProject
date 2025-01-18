import { PrimaryButton } from "@components/Buttons"
import { BodyText, Title } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import {
  ClientSideEvent,
  clientSideEventFromResponse
} from "@event/ClientSideEvent"
import { setEventDetailsQueryEvent } from "@event/DetailsQuery"
import { QueryHookOptions } from "@lib/ReactQuery"
import { useLastDefinedValue } from "@lib/utils/UseLastDefinedValue"
import {
  useRequestForegroundLocationPermissions,
  useUserCoordinatesQuery
} from "@location/index"
import { UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query"
import { TiFAPI } from "TiFShared/api"
import { LocationAccuracy, PermissionResponse } from "expo-location"
import React, { useState } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { ExploreEventsBottomSheet } from "./BottomSheet"
import {
  ExploreEventsInitialCenter,
  initialCenterToRegion
} from "./InitialCenter"
import { ExploreEventsMap } from "./Map"
import {
  ExploreEventsRegion,
  XEROX_ALTO_DEFAULT_REGION,
  createDefaultMapRegion,
  maxRegionMeterRadius
} from "./Region"
import { SkeletonEventCard } from "./SkeletonEventCard"

export const eventsByRegion = async (
  region: ExploreEventsRegion,
  signal?: AbortSignal,
  api: TiFAPI = TiFAPI.productionInstance
) => {
  return (
    await api.exploreEvents({
      body: {
        userLocation: {
          latitude: region.latitude,
          longitude: region.longitude
        },
        radius: maxRegionMeterRadius(region) * 3
      },
      signal
    })
  ).data.events.map(clientSideEventFromResponse)
}

/**
 * Data representation of events explored in a given area.
 */
export type ExploreEventsData =
  | { status: "pending"; events?: ClientSideEvent[] }
  | { status: "error"; events?: ClientSideEvent[]; retry: () => void }
  | { status: "no-results"; events: [] }
  | { status: "success"; events: ClientSideEvent[] }

export type UseExploreEventsEnvironment = {
  fetchEvents: (
    region: ExploreEventsRegion,
    signal?: AbortSignal
  ) => Promise<ClientSideEvent[]>
  isSignificantlyDifferentRegions: (
    r1: ExploreEventsRegion,
    r2: ExploreEventsRegion
  ) => boolean
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
    updateRegion: (newRegion: ExploreEventsRegion) => {
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
  query: UseQueryResult<ClientSideEvent[], unknown>
): ExploreEventsData => {
  if (query.isPending) {
    return { status: "pending" }
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
    userRegion === "pending"
      ? pannedRegion
      : (pannedRegion ?? userRegion ?? XEROX_ALTO_DEFAULT_REGION)
  return { region: exploreRegion, panToRegion: setPannedRegion }
}

type UserRegionResult = "pending" | (ExploreEventsRegion | undefined)

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
    return "pending"
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
  region: ExploreEventsRegion,
  fetchEvents: (
    region: ExploreEventsRegion,
    signal?: AbortSignal
  ) => Promise<ClientSideEvent[]>,
  options: QueryHookOptions<ClientSideEvent[]>
) => {
  const queryClient = useQueryClient()
  const queryKey = ["explore-events", region]
  return {
    events: useQuery({
      queryKey,
      queryFn: async ({ signal }) => {
        const events = await fetchEvents(region, signal)
        events.forEach((event) => setEventDetailsQueryEvent(queryClient, event))
        return events
      },
      ...options
    }),
    cancel: () => {
      queryClient.cancelQueries({ queryKey })
    }
  }
}

export type ExploreEventsProps = {
  region?: ExploreEventsRegion
  data: ExploreEventsData
  onRegionUpdated: (region: ExploreEventsRegion) => void
  style?: StyleProp<ViewStyle>
}

/**
 * A view which allows users to interactively explore events in any given area.
 */
export const ExploreEventsView = ({
  region,
  data,
  onRegionUpdated,
  style
}: ExploreEventsProps) => {
  // NB: - Ensure the current events are still on the map when the
  // user pans to a new region
  const mapEventsData = useLastDefinedValue(data.events)
  return (
    <View style={[style, styles.container]}>
      {region ? (
        <ExploreEventsMap
          initialRegion={region}
          onRegionChanged={onRegionUpdated}
          events={mapEventsData ?? []}
          style={styles.map}
        />
      ) : (
        <Water />
      )}
      <ExploreEventsBottomSheet
        events={data.events ?? []}
        HeaderComponent={
          data.status !== "pending" ? NearbyHeader : FindingHeader
        }
        EmptyEventsComponent={
          <View style={styles.emptyEventsContainer}>
            {data.status === "pending" && <LoadingView />}
            {data.status === "error" && <ErrorView onRetried={data.retry} />}
            {data.status === "no-results" && <NoResultsView />}
          </View>
        }
      />
    </View>
  )
}

const NearbyHeader = () => (
  <Title style={styles.sheetHeaderText}>Nearby Events</Title>
)
const FindingHeader = () => (
  <Title style={styles.sheetHeaderText}>Finding Nearby Events...</Title>
)

type ErrorProps = {
  onRetried: () => void
}

const ErrorView = ({ onRetried }: ErrorProps) => (
  <View style={styles.emptyEventsContentContainer}>
    <Ionicon name="flame" size={48} style={styles.emptyEventsIcon} />
    <BodyText style={styles.emptyEventsText}>
      An error occurred, please try again.
    </BodyText>
    <PrimaryButton style={styles.tryAgainButton} onPress={onRetried}>
      Try Again
    </PrimaryButton>
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
    paddingHorizontal: 24,
    paddingBottom: 16
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
