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

const exploreQueryUserLocation = async () => {
  return await expoQueryUserCoordinates("approximate-low")
}

/**
 * Fetches the user location on the explore screen by first requesting
 * for foreground location permissions.
 */
export const exploreFetchUserLocation = async (
  requestPermission: () => Promise<LocationPermissionResponse> = requestForegroundPermissionsAsync,
  fetchLocation: () => Promise<TrackedLocationCoordinates> = exploreQueryUserLocation
) => {
  const didGrantLocationPermissions = await requestPermission().then(
    (res) => res.granted
  )

  if (!didGrantLocationPermissions) {
    return { status: "permission-denied" }
  }

  return { status: "success", location: await fetchLocation() }
}

export type ExlporeEnvironment = {
  fetchEvents: (
    center: LocationCoordinate2D,
    radiusMeters: number
  ) => Promise<CurrentUserEvent>
  fetchUserLocation: () => Promise<LocationCoordinate2D>
}

export const useExplore = () => {}

export type ExploreProps = {
  style?: StyleProp<ViewStyle>
}

export const ExploreView = ({ style }: ExploreProps) => <></>
