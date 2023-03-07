import { useDependencyValue } from "../lib/dependencies"
import { geocodingDependencyKey, Location } from "../lib/location"
import { useQuery } from "react-query"

export type UseGeocodingQueryOptions = {
  enabled: boolean
}

/**
 * Reverse geocodes the best placemark for a location.
 */
export const useReverseGeocodeQuery = (
  location: Location,
  options?: UseGeocodingQueryOptions
) => {
  const geocoding = useDependencyValue(geocodingDependencyKey)
  return useQuery(
    ["reverseGeocode", location, geocoding.reverseGeocode],
    async () => await geocoding.reverseGeocode(location).then((res) => res[0]),
    { ...options }
  )
}
