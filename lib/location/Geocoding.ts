import { Placemark } from "./Placemark"
import ExpoLocation from "expo-location"
import { createDependencyKey } from "../dependencies"
import { LocationCoordinate2D } from "./Location"
import { nullsToUndefined } from "@lib/NullsToUndefined"

/**
 * An interface for geocoding operations.
 */
export interface Geocoding {
  /**
   * Geocodes an address into a list of candidate locations.
   *
   * @param address a string that is a formatted address (eg. `"1234 Cupertino Rd, Cupertino, CA 95104"`)
   */
  geocode: (address: string) => Promise<LocationCoordinate2D[]>

  /**
   * Reverse geocodes a list of placemarks from a given location.
   *
   * On Android, the implementation of this function may require that the
   * user has accepted Location permissions.
   */
  reverseGeocode: (location: LocationCoordinate2D) => Promise<Placemark[]>
}

/**
 * `Geocoding` operations implemented by expo.
 */
export class ExpoGeocoding implements Geocoding {
  async geocode (address: string) {
    return (await ExpoLocation.geocodeAsync(address)) as LocationCoordinate2D[]
  }

  async reverseGeocode (location: LocationCoordinate2D) {
    return nullsToUndefined(
      await ExpoLocation.reverseGeocodeAsync({
        ...location
      })
    ) as Placemark[]
  }
}

/**
 * `DependencyKey` for `Geocoding` operations.
 */
export const geocodingDependencyKey = createDependencyKey<Geocoding>(
  new ExpoGeocoding()
)
