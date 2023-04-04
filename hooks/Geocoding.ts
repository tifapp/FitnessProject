import { useDependencyValue } from "../lib/dependencies"
import { geocodingDependencyKey, LocationCoordinate2D } from "../lib/location"
import { useQuery } from "react-query"

/**
 * Reverse geocodes the best placemark for a location.
 */
export const useReverseGeocodeQuery = (location: LocationCoordinate2D) => {
  const geocoding = useDependencyValue(geocodingDependencyKey)
  return useQuery(
    ["reverseGeocode", location, geocoding.reverseGeocode],
    async () => await geocoding.reverseGeocode(location).then((res) => res[0])
  )
}
