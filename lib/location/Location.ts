import { faker } from "@faker-js/faker"
import geohash from "ngeohash"
import { z } from "zod"
import {
  degreesToRadians,
  EARTH_RADIUS_METERS,
  metersToMiles,
  sin2
} from "../Math"
import { mockPlacemark, PlacemarkSchema } from "./Placemark"

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
 * Checks for equality on two sets of coordinates.
 */
export const checkIfCoordsAreEqual = (
  coordsA: LocationCoordinate2D,
  coordsB: LocationCoordinate2D
) => {
  return (
    coordsA.longitude === coordsB.longitude &&
    coordsA.latitude === coordsB.latitude
  )
}

/**
 * Generates a mock coordinate for testing and UI purposes.
 */
export const mockLocationCoordinate2D = (): LocationCoordinate2D => ({
  latitude: parseFloat(faker.address.latitude()),
  longitude: parseFloat(faker.address.longitude())
})

/**
 * Some mock Location coordinates suitable for testing.
 */
export namespace LocationCoordinatesMocks {
  export const SantaCruz = {
    latitude: 36.9741,
    longitude: -122.0308
  } as const

  export const NYC = {
    latitude: 40.7128,
    longitude: -74.006
  } as const

  export const SanFrancisco = {
    latitude: 37.7749,
    longitude: -122.4194
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
 * A zod schema for {@link TiFLocation}.
 */
export const TiFLocationSchema = z.object({
  coordinates: LocationCoordinates2DSchema,
  placemark: PlacemarkSchema
})

/**
 * A type that maps a lat-lng coordinate to its respective placemark.
 */
export type TiFLocation = Readonly<z.infer<typeof TiFLocationSchema>>

/**
 * Creates a mock location for testing and UI purposes.
 */
export const mockTiFLocation = (
  coordinates?: LocationCoordinate2D
): TiFLocation => ({
  coordinates: coordinates ?? mockLocationCoordinate2D(),
  placemark: mockPlacemark()
})

/**
 * Computes the number of meters between 2 locations using the haversine formula.
 *
 * For more info on the math: https://en.wikipedia.org/wiki/Haversine_formula
 */
export const metersBetweenLocations = (
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

  const latDelta = sin2(latDeltaRadians / 2)
  const latCos = Math.cos(lat1Radians) * Math.cos(lat2Radians)
  const lngDelta = sin2(lngDeltaRadians / 2)

  return (
    2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(latDelta + latCos * lngDelta))
  )
}

/**
 * Computes the number of miles between 2 locations using the haversine formula.
 *
 * For more info on the math: https://en.wikipedia.org/wiki/Haversine_formula
 */
export const milesBetweenLocations = (
  location1: LocationCoordinate2D,
  location2: LocationCoordinate2D
) => {
  return metersToMiles(metersBetweenLocations(location1, location2))
}

/**
 * Produces a geohash of a location coordinate.
 */
export const hashLocationCoordinate = (coordinate: LocationCoordinate2D) => {
  return geohash.encode(coordinate.latitude, coordinate.longitude)
}
