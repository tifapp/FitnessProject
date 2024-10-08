import React, { ReactNode, createContext, useContext } from "react"
import { NamedLocation } from "./NamedLocation"
import { useQuery } from "@tanstack/react-query"
import { QueryHookOptions } from "@lib/ReactQuery"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { Placemark } from "TiFShared/domain-models/Placemark"
import { reverseGeocodeAsync, geocodeAsync } from "expo-location"
import { placemarkToFormattedAddress } from "@lib/AddressFormatting"
import { mergeWithPartial } from "TiFShared/lib/Object"

/**
 * Reverse geocodes the most accurrate location for the given coordinates.
 */
export const useReverseGeocodeQuery = (
  coordinates: LocationCoordinate2D,
  options: QueryHookOptions<
    NamedLocation | undefined
  > = DEFAULT_GEOCODE_QUERY_OPTIONS
) => {
  const { reverseGeocode } = useGeocodingFunctions()
  return useQuery(
    ["reverseGeocode", coordinates],
    async () => await reverseGeocode(coordinates),
    options
  )
}

/**
 * Geocodes the most accurrate location for the given coordinates.
 */
export const useGeocodeQuery = (
  placemark: Placemark,
  options: QueryHookOptions<
    NamedLocation | undefined
  > = DEFAULT_GEOCODE_QUERY_OPTIONS
) => {
  const { geocode } = useGeocodingFunctions()
  return useQuery(
    ["geocode", placemark],
    async () => await geocode(placemark),
    options
  )
}

// NB: Geocoded data rarely ever changes, so we can
// get away with infinite cache time.
export const DEFAULT_GEOCODE_QUERY_OPTIONS = {
  cacheTime: Infinity,
  staleTime: Infinity
}

/**
 * A set of functions required for performing geocoding operations.
 */
export type GeocodingFunctions = {
  reverseGeocode: (
    coordinates: LocationCoordinate2D
  ) => Promise<NamedLocation | undefined>
  geocode: (placemark: Placemark) => Promise<NamedLocation | undefined>
}

const GeocodingFunctionsContext = createContext<GeocodingFunctions>({
  reverseGeocode: async (coordinate) => {
    const geocodeResults = await reverseGeocodeAsync(coordinate)
    if (geocodeResults.length === 0) return undefined
    const placemark = {
      name: geocodeResults[0].name ?? undefined,
      country: geocodeResults[0].country ?? undefined,
      postalCode: geocodeResults[0].postalCode ?? undefined,
      street: geocodeResults[0].street ?? undefined,
      streetNumber: geocodeResults[0].streetNumber ?? undefined,
      region: geocodeResults[0].region ?? undefined,
      isoCountryCode: geocodeResults[0].isoCountryCode ?? undefined,
      city: geocodeResults[0].city ?? undefined
    }
    return { coordinate, placemark }
  },
  geocode: async (placemark) => {
    const addressString = placemarkToFormattedAddress(placemark)
    if (!addressString) return undefined
    const geocodeResults = await geocodeAsync(addressString)
    if (geocodeResults.length === 0) return undefined
    const coordinate = {
      latitude: geocodeResults[0].latitude,
      longitude: geocodeResults[0].longitude
    }
    return { coordinate, placemark }
  }
})

/**
 * Uses the current geocoded functions provided by {@link GeocodingFunctionsProvider}.
 */
export const useGeocodingFunctions = () =>
  useContext(GeocodingFunctionsContext)!

export type GeocodingFunctionsProviderProps = Partial<GeocodingFunctions> & {
  children: ReactNode
}

/**
 * Provides the children with controllable operations for geocoding locations.
 */
export const GeocodingFunctionsProvider = ({
  children,
  ...props
}: GeocodingFunctionsProviderProps) => (
  <GeocodingFunctionsContext.Provider
    value={mergeWithPartial(useGeocodingFunctions(), props)}
  >
    {children}
  </GeocodingFunctionsContext.Provider>
)
