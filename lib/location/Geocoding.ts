import { createDependencyKey } from "../dependencies"
import { LocationCoordinate2D, Location } from "./Location"

export type ReverseGeocodeLocation = (coordinates: LocationCoordinate2D) => Promise<Location>

export namespace GeocodingDependencyKeys {
  // TODO: - Live Value
  export const reverseGeocode = createDependencyKey<ReverseGeocodeLocation>()
}
