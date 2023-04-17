import { LocationCoordinate2D, Location } from "./Location"

/**
 * Reverse geocodes the given coordinates.
 */
export type ReverseGeocodeLocation = (
  coordinates: LocationCoordinate2D
) => Promise<Location>
