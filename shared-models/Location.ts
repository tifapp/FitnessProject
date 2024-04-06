import geohash from "ngeohash"
import { z } from "zod"
import {
  LocationCoordinate2D,
  LocationCoordinate2DSchema
} from "TiFShared/domain-models/LocationCoordinate2D"
import { PlacemarkSchema } from "TiFShared/domain-models/Placemark"

export const EXPO_LOCATION_ERRORS = {
  noPermissions: "E_NO_PERMISSIONS",
  servicesDisabled: "E_LOCATION_SERVICES_DISABLED"
}

/**
 * A zod schema for {@link TiFLocation}.
 */
export const TiFLocationSchema = z.object({
  coordinate: LocationCoordinate2DSchema,
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
