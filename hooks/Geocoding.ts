import { createDependencyKey, useDependencyValue } from "../lib/dependencies"
import { LocationCoordinate2D, ReverseGeocodeLocation } from "../lib/location"
import { useQuery } from "react-query"

/**
 * Dependency keys for doing geocoding.
 */
export namespace GeocodingDependencyKeys {
  // TODO: - Live Value
  export const reverseGeocode = createDependencyKey<ReverseGeocodeLocation>()
}

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
  const reverseGeocode = useDependencyValue(
    GeocodingDependencyKeys.reverseGeocode
  )
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
