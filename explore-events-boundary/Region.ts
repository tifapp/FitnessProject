import { milesToMeters } from "TiFShared/lib/MetricConversions"
import {
  LocationCoordinate2D,
  coordinateDistance
} from "TiFShared/domain-models/LocationCoordinate2D"

/**
 * A type representing the area around a given lat-lng coordinate.
 */
export type ExploreEventsRegion = LocationCoordinate2D & {
  latitudeDelta: number
  longitudeDelta: number
}

/**
 * Returns true if 2 regions are either not contained within each other,
 * or have a minimum radius difference above the given threshold (in meters).
 *
 * The minimum radius of a region is computed based on the minimum of
 * its latitude and longitude delta.
 *
 * @param r1 see {@link ExploreEventsRegion}
 * @param r2 see {@link ExploreEventsRegion}
 * @param radiusMetersDifferenceThreshold the minimum radius difference threshold if the regions are contained within each other
 */
export const isSignificantlyDifferentRegions = (
  r1: ExploreEventsRegion,
  r2: ExploreEventsRegion,
  radiusMetersDifferenceThreshold: number = milesToMeters(5)
) => {
  const isAboveRadiusDiffThreshold = isMinRadiusDifferenceAboveThreshold(
    r1,
    r2,
    radiusMetersDifferenceThreshold
  )
  return !containsRegion(r1, r2) || isAboveRadiusDiffThreshold
}

const isMinRadiusDifferenceAboveThreshold = (
  r1: ExploreEventsRegion,
  r2: ExploreEventsRegion,
  thresholdMeters: number
) => {
  const radiusDiff = maxRegionMeterRadius(r1) - maxRegionMeterRadius(r2)
  return Math.abs(radiusDiff) > thresholdMeters
}

/**
 * Computes the maximum radius in meters of a region.
 *
 * The minimum radius is computed based on the maximum of the latitude and longitude delta.
 */
export const maxRegionMeterRadius = (region: ExploreEventsRegion) => {
  const isMinLatitude = region.latitudeDelta < region.longitudeDelta
  return coordinateDistance(
    region,
    {
      latitude:
        region.latitude + (isMinLatitude ? 0 : region.latitudeDelta / 2),
      longitude:
        region.longitude + (isMinLatitude ? region.longitudeDelta / 2 : 0)
    },
    "meters"
  )
}

/**
 * Returns true if any points in a region are contained within another region.
 */
export const containsRegion = (
  region: ExploreEventsRegion,
  other: ExploreEventsRegion
) => {
  return containsRegionRect(regionRect(region), regionRect(other))
}

/**
 * The area of a region of latlng coordinates enclosed in a rectangle.
 */
export type ExploreEventsRegionRect = {
  northLatitude: number
  southLatitude: number
  westLongitude: number
  eastLongitude: number
}

/**
 * Creates a lat-lng rectangle from a region.
 *
 * @returns see {@link ExploreEventsRegionRect}
 */
export const regionRect = (
  region: ExploreEventsRegion
): ExploreEventsRegionRect => ({
  northLatitude: region.latitude + region.latitudeDelta / 2,
  southLatitude: region.latitude - region.latitudeDelta / 2,
  eastLongitude: region.longitude + region.longitudeDelta / 2,
  westLongitude: region.longitude - region.longitudeDelta / 2
})

/**
 * Returns true if any of the points in `rect1` are contained in `rect2`.
 */
export const containsRegionRect = (
  rect1: ExploreEventsRegionRect,
  rect2: ExploreEventsRegionRect
) => {
  const isTopLeftIntersection =
    isTopIntersection(rect1, rect2) && isLeftIntersection(rect1, rect2)

  const isTopRightIntersection =
    isTopIntersection(rect1, rect2) && isRightIntersection(rect1, rect2)

  const isBottomRightIntersection =
    isBottomIntersection(rect1, rect2) && isRightIntersection(rect1, rect2)

  const isBottomLeftIntersection =
    isBottomIntersection(rect1, rect2) && isLeftIntersection(rect1, rect2)
  return (
    isTopLeftIntersection ||
    isTopRightIntersection ||
    isBottomLeftIntersection ||
    isBottomRightIntersection
  )
}

const isTopIntersection = (
  rect1: ExploreEventsRegionRect,
  rect2: ExploreEventsRegionRect
) => {
  return (
    rect1.southLatitude >= rect2.southLatitude &&
    rect1.southLatitude <= rect2.northLatitude
  )
}

const isBottomIntersection = (
  rect1: ExploreEventsRegionRect,
  rect2: ExploreEventsRegionRect
) => {
  return (
    rect1.northLatitude >= rect2.southLatitude &&
    rect1.northLatitude <= rect2.northLatitude
  )
}

const isLeftIntersection = (
  rect1: ExploreEventsRegionRect,
  rect2: ExploreEventsRegionRect
) => {
  return (
    rect1.eastLongitude >= rect2.westLongitude &&
    rect1.eastLongitude <= rect2.eastLongitude
  )
}

const isRightIntersection = (
  rect1: ExploreEventsRegionRect,
  rect2: ExploreEventsRegionRect
) => {
  return (
    rect1.westLongitude >= rect2.westLongitude &&
    rect1.westLongitude <= rect2.eastLongitude
  )
}

/**
 * Creates an {@link Region} from a coordinate suitable for the explore map.
 */
export const createDefaultMapRegion = (
  coordinates: LocationCoordinate2D
): ExploreEventsRegion => ({
  ...coordinates,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1
})

/**
 * The default region if none can be retreived from location search or the user's location.
 */
export const XEROX_ALTO_DEFAULT_REGION = createDefaultMapRegion({
  latitude: 37.414045,
  longitude: -122.077044
})
