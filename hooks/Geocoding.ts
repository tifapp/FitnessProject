import { useDependencyValue } from "@lib/dependencies"
import { geocodingDependencyKey, Location } from "@lib/location"
import { useQuery } from "react-query"

/**
 * Reverse geocodes the best placemark for a location.
 */
export const useReverseGeocodeQuery = (location: Location) => {
  const geocoding = useDependencyValue(geocodingDependencyKey)
  return useQuery(
    ["reverseGeocode", location, geocoding.reverseGeocode],
    async () => await geocoding.reverseGeocode(location).then((res) => res[0])
  )
}
