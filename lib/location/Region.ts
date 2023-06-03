import { LocationCoordinate2D } from "./Location"

/**
 * A type representing the area around a given lat-lng coordinate.
 */
export type Region = LocationCoordinate2D & {
  latitudeDelta: number
  longitudeDelta: number
}

export type RegionRect = {
  northLatitude: number
  southLatitude: number
  westLongitude: number
  eastLongitude: number
}

/**
 * Takes the minimum radius of the latitude and longitude delta of a region.
 * The minimum radius is defined as the half the minimum of the latitude and longitude deltas.
 */
export const minRegionRadius = (region: Region) => {
  return Math.min(region.latitudeDelta, region.longitudeDelta) / 2
}

/**
 * Returns true if any points in a region are contained within another region.
 */
export const containsRegion = (region: Region, other: Region) => {
  return containsRegionRect(regionRect(region), regionRect(other))
}

/**
 * Creates a lat-lng rectangle from a region.
 *
 * @returns see {@link RegionRect}
 */
export const regionRect = (region: Region): RegionRect => ({
  northLatitude: region.latitude + region.latitudeDelta / 2,
  southLatitude: region.latitude - region.latitudeDelta / 2,
  eastLongitude: region.longitude + region.longitudeDelta / 2,
  westLongitude: region.longitude - region.longitudeDelta / 2
})

/**
 * Returns true if any of the points in `rect1` are contained in `rect2`.
 */
export const containsRegionRect = (rect1: RegionRect, rect2: RegionRect) => {
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

const isTopIntersection = (rect1: RegionRect, rect2: RegionRect) => {
  return (
    rect1.southLatitude >= rect2.southLatitude &&
    rect1.southLatitude <= rect2.northLatitude
  )
}

const isBottomIntersection = (rect1: RegionRect, rect2: RegionRect) => {
  return (
    rect1.northLatitude >= rect2.southLatitude &&
    rect1.northLatitude <= rect2.northLatitude
  )
}

const isLeftIntersection = (rect1: RegionRect, rect2: RegionRect) => {
  return (
    rect1.eastLongitude >= rect2.westLongitude &&
    rect1.eastLongitude <= rect2.eastLongitude
  )
}

const isRightIntersection = (rect1: RegionRect, rect2: RegionRect) => {
  return (
    rect1.westLongitude >= rect2.westLongitude &&
    rect1.westLongitude <= rect2.eastLongitude
  )
}
