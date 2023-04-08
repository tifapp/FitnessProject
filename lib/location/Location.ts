import {
  degreesToRadians,
  EARTH_RADIUS_METERS,
  METERS_PER_MILE,
  sin2
} from "../Math"
import { z } from "zod"

/**
 * A zod schema for {@link LocationCoordinate2D}.
 */
export const LocationCoordinates2DSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
})

/**
 * A simple latitude and longitude based coordinate.
 */
export type LocationCoordinate2D = Readonly<
  z.infer<typeof LocationCoordinates2DSchema>
>

/**
 * Some mock Location coordinates suitable for testing.
 */
export namespace LocationCoordinatesMocks {
  export const SantaCruz = {
    latitude: 36.9741,
    longitude: 122.0308
  } as const

  export const NYC = {
    latitude: 40.7128,
    longitude: 74.0060
  } as const

  export const SanFrancisco = {
    latitude: 37.7749,
    longitude: 122.4194
  } as const

  export const London = {
    latitude: 51.5072,
    longitude: 0.1276
  } as const

  export const Paris = {
    latitude: 48.8566,
    longitude: 2.3522
  } as const
}

/**
 * A location object meant for tracking purposes.
 */
export type TrackedLocationCoordinates = Readonly<{
  coordinates: LocationCoordinate2D
  trackingDate: Date
}>

/**
 * Computes the number of miles between 2 locations using the haversine formula.
 *
 * For more info on the math: https://en.wikipedia.org/wiki/Haversine_formula
 */
export const milesBetweenLocations = (
  location1: LocationCoordinate2D,
  location2: LocationCoordinate2D
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
