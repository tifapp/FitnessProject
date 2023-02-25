import { useDependencyValue } from "@lib/dependencies"
import { geocodingDependencyKey, Location } from "@lib/location"
import { useQuery } from "react-query"

/**
 * Geocodes an individual location and returns the best result.
 */
export const useReverseGeocode = (location: Location) => {
  const geocoding = useDependencyValue(geocodingDependencyKey)
  return useQuery(
    ["reverseGeocode", location, geocoding.reverseGeocode],
    async () => await geocoding.reverseGeocode(location).then((res) => res[0])
  )
}
