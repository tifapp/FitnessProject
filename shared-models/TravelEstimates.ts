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
