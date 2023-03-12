import { ArrayUtils } from "@lib/Array"
import { Geo } from "aws-amplify"
import { Location } from "../Location"
import "react-native-get-random-values"
import "react-native-url-polyfill/auto"
import { AmplifyLocationSearchUtils } from "./AmplifyUtils"
import { LocationSearchResult } from "./Result"
import { createDependencyKey } from "@lib/dependencies"

/**
 * Options for calling a {@link TextSearchLocations} function.
 */
export type LocationTextSearchOptions = {
  /**
   * A location to bias the results around.
   */
  nearLocation?: Location

  /**
   * The upper bound of results to be returned.
   *
   * The default is dependent on the text search provider.
   */
  limit?: number
}

/**
 * A function type for searching for locations via free form text.
 *
 * ```ts
 * const search: TextSearchLocations = (query, options) => ({ ... })
 * const locations = await search("McDonalds Play Places", { limit: 20 })
 * ```
 */
export type TextSearchLocations = (
  query: string,
  options?: LocationTextSearchOptions
) => Promise<LocationSearchResult[]>

/**
 * A {@link TextSearchLocations} instance backed by amplify.
 *
 * This function calls `Geo.searchByText` under the hood, and translates
 * responses from aws into {@link LocationSearchResult} types.
 */
export const amplifyTextSearchLocations = async (
  query: string,
  options?: LocationTextSearchOptions
) => {
  return await Geo.searchByText(query, {
    countries: ["USA"],
    biasPosition: options?.nearLocation
      ? [options.nearLocation.longitude, options.nearLocation.latitude]
      : undefined,
    maxResults: options?.limit
  }).then((results) =>
    ArrayUtils.removeOptionals(
      results.map(AmplifyLocationSearchUtils.placeToSearchResult)
    )
  )
}

/**
 * A Dependency Key for {@link TextSearchLocations}.
 */
export const textSearchLocationsDependencyKey =
  createDependencyKey<TextSearchLocations>(() => amplifyTextSearchLocations)
