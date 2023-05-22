import { CurrentUserEvent } from "@lib/events"
import {
  LocationCoordinate2D,
  TrackedLocationCoordinates,
  expoQueryUserCoordinates
} from "@lib/location"
import React, { useEffect } from "react"
import { StyleProp, ViewStyle } from "react-native"
import {
  LocationPermissionResponse,
  requestForegroundPermissionsAsync
} from "expo-location"
import { useQuery } from "react-query"
import { milesToMeters } from "@lib/Math"

const exploreEventsQueryUserLocation = async () => {
  return await expoQueryUserCoordinates("approximate-low")
}

export type ExploreEventsUserLocation =
  | { status: "permission-denied"; location: undefined }
  | { status: "success"; location: TrackedLocationCoordinates }

/**
 * Fetches the user location on the explore screen by first requesting
 * for foreground location permissions.
 */
export const exploreEventsFetchUserLocation = async (
  requestPermission: () => Promise<LocationPermissionResponse> = requestForegroundPermissionsAsync,
  fetchLocation: () => Promise<TrackedLocationCoordinates> = exploreEventsQueryUserLocation
): Promise<ExploreEventsUserLocation> => {
  const didGrantLocationPermissions = await requestPermission().then(
    (res) => res.granted
  )

  if (!didGrantLocationPermissions) {
    return { status: "permission-denied", location: undefined }
  }

  return { status: "success", location: await fetchLocation() }
}

export type ExploreEventsError =
  | "user-location"
  | "events-loading"
  | "no-results"

export type ExploreEventsData =
  | { status: "error"; type: ExploreEventsError }
  | { status: "success"; events: CurrentUserEvent[] }
  | { status: "loading" }

export type UseExploreEventsResult = {
  data: ExploreEventsData
}

export type UseExploreEventsProps = {
  center?: LocationCoordinate2D
  fetchEvents?: (center: LocationCoordinate2D) => Promise<CurrentUserEvent[]>
  fetchUserLocation?: () => Promise<ExploreEventsUserLocation>
  onUserLocationPermissionDenied: () => void
}

export const useExploreEvents = ({
  center,
  fetchEvents = async () => [] as CurrentUserEvent[],
  fetchUserLocation = exploreEventsFetchUserLocation,
  onUserLocationPermissionDenied
}: UseExploreEventsProps): UseExploreEventsResult => {
  const data = useExploreEventsData({
    center,
    fetchEvents,
    fetchUserLocation,
    onUserLocationPermissionDenied
  })
  return { data }
}

type UseExploreEventsDataProps = {
  center?: LocationCoordinate2D
  fetchEvents: (center: LocationCoordinate2D) => Promise<CurrentUserEvent[]>
  fetchUserLocation: () => Promise<ExploreEventsUserLocation>
  onUserLocationPermissionDenied: () => void
}

const useExploreEventsData = ({
  center,
  fetchEvents,
  fetchUserLocation,
  onUserLocationPermissionDenied
}: UseExploreEventsDataProps): ExploreEventsData => {
  const { data: userLocation, isError: isLocationError } =
    useExploreEventsUserLocation(
      fetchUserLocation,
      onUserLocationPermissionDenied,
      !center
    )

  const { data: events, isError: isEventsError } = useEventsQuery(
    center ?? userLocation?.location?.coordinates,
    fetchEvents
  )

  if (isLocationError) return { status: "error", type: "user-location" }
  if (isEventsError) return { status: "error", type: "events-loading" }
  if (!events) return { status: "loading" }
  return events.length === 0
    ? { status: "error", type: "no-results" }
    : { status: "success", events }
}

const useEventsQuery = (
  center: LocationCoordinate2D | undefined,
  fetchEvents: (center: LocationCoordinate2D) => Promise<CurrentUserEvent[]>
) => {
  return useQuery(
    ["explore-events", center],
    // NB: We must have a center for this query to be enabled, so the force unwrap is safe
    async () => await fetchEvents(center!),
    { enabled: !!center }
  )
}

const useExploreEventsUserLocation = (
  fetchLocation: () => Promise<ExploreEventsUserLocation>,
  onPermissionDenied: () => void,
  isEnabled: boolean
) => {
  const query = useQuery(
    ["explore-events-user-location"],
    async () => await fetchLocation(),
    { enabled: isEnabled }
  )
  const { data } = query
  useEffect(() => {
    if (data?.status === "permission-denied") {
      onPermissionDenied()
    }
  }, [data?.status, onPermissionDenied])
  return query
}

export type ExploreEventsProps = {
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsView = ({ style }: ExploreEventsProps) => <></>
