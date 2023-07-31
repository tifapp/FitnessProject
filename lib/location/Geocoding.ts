import { LocationCoordinate2D, TiFLocation } from "./Location"

/**
 * Reverse geocodes the given coordinates.
 */
export type ReverseGeocodeLocation = (
  coordinates: LocationCoordinate2D
) => Promise<TiFLocation>
