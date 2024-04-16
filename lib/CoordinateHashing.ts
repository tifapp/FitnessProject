import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import geohash from "ngeohash"

/**
 * Produces a geohash of a location coordinate.
 */
export const hashCoordinate = (coordinate: LocationCoordinate2D) => {
  return geohash.encode(coordinate.latitude, coordinate.longitude)
}
