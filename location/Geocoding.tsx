import React, { ReactNode, createContext, useContext } from "react"
import { NamedLocation } from "./NamedLocation"
import { useQuery } from "@tanstack/react-query"
import { QueryHookOptions } from "@lib/ReactQuery"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"

/**
 * Reverse geocodes the most accurrate location for the given coordinates.
 */
export const useReverseGeocodeQuery = (
  coordinates: LocationCoordinate2D,
  options: QueryHookOptions<NamedLocation> = DEFAULT_REVERSE_GEOCODE_QUERY_OPTIONS
) => {
  const { reverseGeocode } = useGeocodingFunctions()
  return useQuery(
    ["reverseGeocode", coordinates],
    async () => await reverseGeocode(coordinates),
    // NB: Geocoded data rarely ever changes, so we can
    // get away with infinite cache time.
    options
  )
}

// NB: Geocoded data rarely ever changes, so we can
// get away with infinite cache time.
export const DEFAULT_REVERSE_GEOCODE_QUERY_OPTIONS = {
  cacheTime: Infinity,
  staleTime: Infinity
}

/**
 * A set of functions required for performing geocoding operations.
 */
export type GeocodingFunctions = {
  reverseGeocode: (coordinates: LocationCoordinate2D) => Promise<NamedLocation>
}

const GeocodingFunctionsContext = createContext<GeocodingFunctions | undefined>(
  undefined
)

/**
 * Uses the current geocoded functions provided by {@link GeocodingFunctionsProvider}.
 */
export const useGeocodingFunctions = () =>
  useContext(GeocodingFunctionsContext)!

export type GeocodingFunctionsProviderProps = GeocodingFunctions & {
  children: ReactNode
}

/**
 * Provides the children with controllable operations for geocoding locations.
 */
export const GeocodingFunctionsProvider = ({
  children,
  ...props
}: GeocodingFunctionsProviderProps) => (
  <GeocodingFunctionsContext.Provider value={props}>
    {children}
  </GeocodingFunctionsContext.Provider>
)
