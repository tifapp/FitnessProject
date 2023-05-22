import { CurrentUserEvent } from "@lib/events"
import {
  LocationCoordinate2D,
  TrackedLocationCoordinates,
  expoQueryUserCoordinates
} from "@lib/location"
import React, { useEffect, useState } from "react"
import { StyleProp, ViewStyle } from "react-native"
import {
  LocationPermissionResponse,
  requestForegroundPermissionsAsync
} from "expo-location"
import { useQuery } from "react-query"

const exploreEventsQueryUserLocation = async () => {
  return await expoQueryUserCoordinates("approximate-low")
}

export type ExploreEventsUserLocation =
  | {
      status: "permission-denied"
    }
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
    return { status: "permission-denied" }
  }

  return { status: "success", location: await fetchLocation() }
}

export type ExploreEventsError =
  | "user-location"
  | "events-loading"
  | "no-results"

export type ExploreEventsData =
  | { status: "error"; type: ExploreEventsError }
  | { status: "success" }

export type UseExploreEventsResult = {
  data: ExploreEventsData
}

export type UseExploreEventsProps = {
  center?: LocationCoordinate2D
  fetchEvents?: (
    center: LocationCoordinate2D,
    radiusMeters: number
  ) => Promise<CurrentUserEvent>
  fetchUserLocation?: () => Promise<ExploreEventsUserLocation>
  onUserLocationPermissionDenied: () => void
}

export const useExploreEvents = ({
  fetchUserLocation = exploreEventsFetchUserLocation,
  onUserLocationPermissionDenied
}: UseExploreEventsProps): UseExploreEventsResult => {
  const { data, isError } = useExploreEventsUserLocation(fetchUserLocation)
  useEffect(() => {
    if (data?.status === "permission-denied") {
      onUserLocationPermissionDenied()
    }
  }, [data?.status, onUserLocationPermissionDenied])
  return {
    data: isError
      ? { status: "error", type: "user-location" }
      : { status: "success" }
  }
}

const useExploreEventsUserLocation = (
  fetchLocation: () => Promise<ExploreEventsUserLocation>
) => {
  return useQuery(["explore-events-user-location"], fetchLocation)
}

export type ExploreEventsProps = {
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsView = ({ style }: ExploreEventsProps) => <></>
