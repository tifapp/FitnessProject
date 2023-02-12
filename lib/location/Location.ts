/**
 * A type representing a tracked location for any particular user.
 */
export type Location = {
  readonly latitude: number
  readonly longitude: number
  readonly date: Date
}

/**
 * Computes the number of miles between 2 locations using the haversine formula.
 */
export const milesBetweenLocations = (
  location1: Location,
  location2: Location
) => {
  const lat1Radians = toRadians(location1.latitude)
  const lat2Radians = toRadians(location2.latitude)

  const latDeltaRadians = toRadians(location2.latitude - location1.latitude)
  const lngDeltaRadians = toRadians(location2.longitude - location1.longitude)

  const sin2HalfLatDelta = sin2(latDeltaRadians / 2)
  const latCos = Math.cos(lat1Radians) * Math.cos(lat2Radians)
  const sin2HalfLngDelta = sin2(lngDeltaRadians / 2)
  const trigCombo = sin2HalfLatDelta + latCos * sin2HalfLngDelta

  const meters = 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(trigCombo))
  return toMiles(meters)
}

const sin2 = (radians: number) => (1 - Math.cos(2 * radians)) / 2

const EARTH_RADIUS_METERS = 6371e3

const toMiles = (meters: number) => meters / 1609.344

const toRadians = (degrees: number) => (degrees * Math.PI) / 180
