import { degreesToRadians, sin2 } from "@lib/Math"

/**
 * A simple latitude and longitude based coordinate.
 */
export type Location = {
  readonly latitude: number
  readonly longitude: number
}

/**
 * A location object meant for tracking purposes.
 */
export type TrackedLocation = {
  location: Location
  trackingDate: Date
}

/**
 * Computes the number of miles between 2 locations using the haversine formula.
 *
 * For more info on the math: https://en.wikipedia.org/wiki/Haversine_formula
 */
export const milesBetweenLocations = (
  location1: Location,
  location2: Location
) => {
  const lat1Radians = degreesToRadians(location1.latitude)
  const lat2Radians = degreesToRadians(location2.latitude)

  const latDeltaRadians = degreesToRadians(
    location2.latitude - location1.latitude
  )
  const lngDeltaRadians = degreesToRadians(
    location2.longitude - location1.longitude
  )

  const sin2HalfLatDelta = sin2(latDeltaRadians / 2)
  const latCos = Math.cos(lat1Radians) * Math.cos(lat2Radians)
  const sin2HalfLngDelta = sin2(lngDeltaRadians / 2)
  const trigCombo = sin2HalfLatDelta + latCos * sin2HalfLngDelta

  const meters = 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(trigCombo))
  return meters / METERS_PER_MILE
}

const EARTH_RADIUS_METERS = 6371e3
const METERS_PER_MILE = 1609.344
