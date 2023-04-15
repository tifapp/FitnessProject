import { useDependencyValue } from "../lib/dependencies"
import { GeocodingDependencyKeys, LocationCoordinate2D } from "../lib/location"
import { useQuery } from "react-query"

export type UseReverseGeocodeQueryOptions = {
  isEnabled?: boolean
}

/**
 * Reverse geocodes the most accurrate location for the given coordinates.
 */
export const useReverseGeocodeQuery = (
  coordinates: LocationCoordinate2D,
  options?: UseReverseGeocodeQueryOptions
) => {
  const reverseGeocode = useDependencyValue(GeocodingDependencyKeys.reverseGeocode)
  return useQuery(
    ["reverseGeocode", coordinates, reverseGeocode],
    async () => await reverseGeocode(coordinates),
    // NB: Geocoded data rarely ever changes, so we can
    // get away with infinite cache time.
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: options?.isEnabled ?? true
    }
  )
}
