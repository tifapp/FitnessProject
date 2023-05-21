import { CurrentUserEvent } from "@lib/events"
import {
  LocationCoordinate2D,
  TrackedLocationCoordinates,
  expoQueryUserCoordinates
} from "@lib/location"
import React from "react"
import { StyleProp, ViewStyle } from "react-native"
import {
  LocationPermissionResponse,
  requestForegroundPermissionsAsync
} from "expo-location"

const exploreEventsQueryUserLocation = async () => {
  return await expoQueryUserCoordinates("approximate-low")
}

/**
 * Fetches the user location on the explore screen by first requesting
 * for foreground location permissions.
 */
export const exploreEventsFetchUserLocation = async (
  requestPermission: () => Promise<LocationPermissionResponse> = requestForegroundPermissionsAsync,
  fetchLocation: () => Promise<TrackedLocationCoordinates> = exploreEventsQueryUserLocation
) => {
  const didGrantLocationPermissions = await requestPermission().then(
    (res) => res.granted
  )

  if (!didGrantLocationPermissions) {
    return { status: "permission-denied" }
  }

  return { status: "success", location: await fetchLocation() }
}

export type ExlporeEventsEnvironment = {
  fetchEvents: (
    center: LocationCoordinate2D,
    radiusMeters: number
  ) => Promise<CurrentUserEvent>
  fetchUserLocation: () => Promise<LocationCoordinate2D>
}

export const useExploreEvents = () => {}

export type ExploreEventsProps = {
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsView = ({ style }: ExploreEventsProps) => <></>
