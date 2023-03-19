import {
  degreesToRadians,
  EARTH_RADIUS_METERS,
  METERS_PER_MILE,
  sin2
} from "../Math"
import { z } from "zod"

/**
 * A zod schema for {@link Location}.
 */
export const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
})

/**
 * A simple latitude and longitude based coordinate.
 */
export type Location = Readonly<z.infer<typeof LocationSchema>>

/**
 * A location object meant for tracking purposes.
 */
export type TrackedLocation = {
  readonly coordinate: Location
  readonly trackingDate: Date
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
