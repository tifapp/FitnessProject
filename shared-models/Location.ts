import geohash from "ngeohash"
import { z } from "zod"
import { PlacemarkSchema } from "./Placemark"
import { metersToMiles } from "TiFShared/lib/MetricConversions"

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

export const EXPO_LOCATION_ERRORS = {
  noPermissions: "E_NO_PERMISSIONS",
  servicesDisabled: "E_LOCATION_SERVICES_DISABLED"
}

/**
 * A zod schema for {@link TiFLocation}.
 */
export const TiFLocationSchema = z.object({
  coordinate: LocationCoordinates2DSchema,
  placemark: PlacemarkSchema
})

/**
 * A type that maps a lat-lng coordinate to its respective placemark.
 */
export type TiFLocation = Readonly<z.infer<typeof TiFLocationSchema>>

const EARTH_RADIUS_METERS = 6371e3

/**
 * Computes the number of meters between 2 locations using the haversine formula.
 *
 * For more info on the math: https://en.wikipedia.org/wiki/Haversine_formula
 */
export const metersBetweenLocations = (
  location1: LocationCoordinate2D,
  location2: LocationCoordinate2D
) => {
  const lat1Radians = Math.degreesToRadians(location1.latitude)
  const lat2Radians = Math.degreesToRadians(location2.latitude)

  const latDeltaRadians = Math.degreesToRadians(
    location2.latitude - location1.latitude
  )
  const lngDeltaRadians = Math.degreesToRadians(
    location2.longitude - location1.longitude
  )

  const latDelta = Math.sin2(latDeltaRadians / 2)
  const latCos = Math.cos(lat1Radians) * Math.cos(lat2Radians)
  const lngDelta = Math.sin2(lngDeltaRadians / 2)

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
