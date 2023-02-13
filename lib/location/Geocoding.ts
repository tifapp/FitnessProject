import { AddressPlacemark } from "./AddressPlacemark"
import ExpoLocation from "expo-location"
import { createDependencyKey } from "@lib/dependencies"
import { Location } from "./Location"

/**
 * An interface for geocoding operations.
 */
export interface Geocoding {
  /**
   * Reverse geocodes a list of addresses from a given location.
   *
   * On Android, the implementation of this function may require that the
   * user has accepted Location permissions.
   */
  reverseGeocode: (location: Location) => Promise<AddressPlacemark[]>
}

const expoReverseGeocode = async (location: Location) => {
  const results = await ExpoLocation.reverseGeocodeAsync({
    ...location
  })
  return results as AddressPlacemark[]
}

/**
 * `DependencyKey` for `Geocoding` operations.
 */
export const geocodingDependencyKey = createDependencyKey<Geocoding>({
  reverseGeocode: expoReverseGeocode
})
