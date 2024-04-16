import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { Placemark } from "TiFShared/domain-models/Placemark"

/**
 * A type that maps a lat-lng coordinate to its respective placemark.
 */
export type NamedLocation = {
  coordinate: LocationCoordinate2D
  placemark: Placemark
}
