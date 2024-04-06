import geohash from "ngeohash"
import { z } from "zod"
import { PlacemarkSchema } from "./Placemark"

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

/**
 * Produces a geohash of a location coordinate.
 */
export const hashLocationCoordinate = (coordinate: LocationCoordinate2D) => {
  return geohash.encode(coordinate.latitude, coordinate.longitude)
}
