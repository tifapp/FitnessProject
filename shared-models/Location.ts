import { z } from "zod"
import { LocationCoordinate2DSchema } from "TiFShared/domain-models/LocationCoordinate2D"
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
export type TiFLocation = z.rInfer<typeof TiFLocationSchema>
