import { LocationCoordinate2D } from "./Location"

/**
 * A type representing the area around a given lat-lng coordinate.
 */
export type Region = LocationCoordinate2D & {
  latitudeDelta: number
  longitudeDelta: number
}

export type RegionRect = {
  topLeft: LocationCoordinate2D
  topRight: LocationCoordinate2D
  bottomLeft: LocationCoordinate2D
  bottomRight: LocationCoordinate2D
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

/**
 * Creates a lat-lng rectangle from a region.
 *
 * @returns see {@link RegionRect}
 */
export const regionRect = (region: Region): RegionRect => ({
  topLeft: {
    latitude: region.latitude + region.latitudeDelta / 2,
    longitude: region.longitude - region.longitudeDelta / 2
  },
  topRight: {
    latitude: region.latitude + region.latitudeDelta / 2,
    longitude: region.longitude + region.longitudeDelta / 2
  },
  bottomLeft: {
    latitude: region.latitude - region.latitudeDelta / 2,
    longitude: region.longitude - region.longitudeDelta / 2
  },
  bottomRight: {
    latitude: region.latitude - region.latitudeDelta / 2,
    longitude: region.longitude + region.longitudeDelta / 2
  }
})

export const containsRegionRect = (rect1: RegionRect, rect2: RegionRect) => {
  return true
}
