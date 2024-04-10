import { Platform } from "react-native"
import { requireOptionalNativeModule } from "@lib/utils/RequireOptionalNativeModule"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"

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

type ObjectRouteKeyName<Kind extends EventTravelEstimateRouteKind> =
  Kind extends "public-transport" ? "publicTransportation" : Kind

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
  [Key in ObjectRouteKeyName<EventTravelEstimateRouteKind>]: {
    travelDistanceMeters: number
    expectedTravelSeconds: number
  } | null
}

interface ExpoTiFTravelEstimatesModule {
  travelEstimatesAsync(
    source: LocationCoordinate2D,
    destination: LocationCoordinate2D
  ): Promise<EventTravelEstimates>

  cancelTravelEstimatesAsync(
    source: LocationCoordinate2D,
    destination: LocationCoordinate2D
  ): Promise<void>
}

const ExpoTiFTravelEstimates =
  requireOptionalNativeModule<ExpoTiFTravelEstimatesModule>(
    "ExpoTiFTravelEstimates"
  )

/**
 * Loads travel estimates for an event.
 *
 * @param eventCoordinate The coordinate of the event.
 * @param userCoordinate The user's location current coordinate.
 * @param signal An {@link AbortSignal} to cancel the request.
 */
export const eventTravelEstimates = async (
  eventCoordinate: LocationCoordinate2D,
  userCoordinate: LocationCoordinate2D,
  signal?: AbortSignal
) => {
  if (!ExpoTiFTravelEstimates) {
    throw new Error(`Travel Estimates are unsupported on ${Platform.OS}.`)
  }
  signal?.addEventListener("abort", () => {
    ExpoTiFTravelEstimates.cancelTravelEstimatesAsync(
      userCoordinate,
      eventCoordinate
    )
  })
  return await ExpoTiFTravelEstimates.travelEstimatesAsync(
    userCoordinate,
    eventCoordinate
  )
}
