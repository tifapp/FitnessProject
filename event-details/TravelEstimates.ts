import { QueryHookOptions } from "@lib/ReactQuery"
import { useUserCoordinatesQuery } from "@location/UserLocation"
import { LocationCoordinate2D } from "@shared-models/Location"
import { useQuery } from "@tanstack/react-query"
import { LocationAccuracy } from "expo-location"
import { Platform } from "react-native"
import { EventLocationCoordinatePlacemark } from "./Event"

/**
 * The supported methods of travel for event travel estimates.
 *
 * These are based on MapKit's `MKDirectionsTransportType`, as travel
 * estimates are only supported on iOS.
 *
 * See: https://developer.apple.com/documentation/mapkit/mkdirections/request/1433152-transporttype
 */
export type EventTravelEstimateRouteKind =
  | "automobile"
  | "walking"
  | "public-transport"
  | "any"

type ObjectRouteKeyName<Kind extends EventTravelEstimateRouteKind> =
  Kind extends "public-transport" ? "publicTransport" : Kind

/**
 * Result of a travel estimates calculation for an event.
 *
 * In most cases, the source coordinate will be similar to, but not exactly
 * the same as the given coordinate during the estimates calculation.
 *
 * Each travel type is listed as a key of this object, and its value contains
 * both the distance and estimated travel time relative to `sourceCoordinate`.
 */
export type EventTravelEstimates = {
  sourceCoordinate: LocationCoordinate2D
} & {
  [Key in ObjectRouteKeyName<EventTravelEstimateRouteKind>]: {
    travelDistanceMeters: number
    estimatedTravelSeconds: number
  } | null
}

export type UseEventTravelEstimatesResult =
  | { status: "loading" | "error" | "unsupported" }
  | { status: "success"; data: EventTravelEstimates }

export type LoadEventTravelEstimates = (
  location: EventLocationCoordinatePlacemark,
  userCoordinate: LocationCoordinate2D,
  abortSignal?: AbortSignal
) => Promise<EventTravelEstimates>

/**
 * A hook to load travel estimates for an event location from the user's
 * current location.
 *
 * **🟡 Android Note:** On android, the return value of this hook is always:
 *
 * `{ status: "unsupported" }`
 */
export const useEventTravelEstimates = (
  location: EventLocationCoordinatePlacemark,
  loadTravelEstimates: LoadEventTravelEstimates
): UseEventTravelEstimatesResult => {
  const isSupported = Platform.OS !== "android"
  const userLocationQuery = useUserCoordinatesQuery(
    { accuracy: LocationAccuracy.BestForNavigation },
    { enabled: isSupported }
  )
  const etaResults = useEventTravelEstimatesQuery(
    userLocationQuery.data?.coords!,
    location,
    loadTravelEstimates,
    { enabled: !!userLocationQuery.data && isSupported }
  )
  if (!isSupported) {
    return { status: "unsupported" }
  } else if (userLocationQuery.isError) {
    return userLocationQuery
  } else {
    return etaResults
  }
}

const useEventTravelEstimatesQuery = (
  userCoordinate: LocationCoordinate2D,
  eventLocation: EventLocationCoordinatePlacemark,
  loadTravelEstimates: LoadEventTravelEstimates,
  options?: QueryHookOptions<EventTravelEstimates>
) => {
  return useQuery(
    ["event-travel-estimates", eventLocation, userCoordinate],
    async ({ signal }) => {
      return await loadTravelEstimates(eventLocation, userCoordinate, signal)
    },
    options
  )
}
