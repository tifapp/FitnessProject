import { LocationCoordinate2D } from "./Location"

/**
 * A type representing the area around a given lat-lng coordinate.
 */
export type Region = LocationCoordinate2D & {
  latitudeDelta: number
  longitudeDelta: number
}

/**
 * Takes the minimum radius of the latitude and longitude delta of a region.
 * The minimum radius is defined as the half the minimum of the latitude and longitude deltas.
 */
export const minRegionRadius = (region: Region) => {
  return Math.min(region.latitudeDelta, region.longitudeDelta) / 2
}

export const containsRegion = (region: Region, other: Region) => {
  return false
}
