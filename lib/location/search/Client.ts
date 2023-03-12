import { ArrayUtils } from "@lib/Array"
import { Geo } from "aws-amplify"
import { Location } from "../Location"
import "react-native-get-random-values"
import "react-native-url-polyfill/auto"

/**
 * A result returned from a {@link LocationSearchClient}.
 */
export type LocationSearchResult = Readonly<{
  name?: string
  formattedAddress?: string
  coordinates: Location
}>

export type LocationTextSearchOptions = {
  biasLocation?: Location
  limit?: number
}

export interface LocationSearchClient {
  textSearch: (
    query: string,
    options?: LocationTextSearchOptions
  ) => Promise<LocationSearchResult[]>
}

export class AmplifyLocationSearchClient implements LocationSearchClient {
  async textSearch (query: string, options?: LocationTextSearchOptions) {
    return await Geo.searchByText(query, {
      countries: ["USA"],
      biasPosition: options?.biasLocation
        ? [options.biasLocation.longitude, options.biasLocation.latitude]
        : undefined,
      maxResults: options?.limit
    }).then((results) =>
      ArrayUtils.removeOptionals(
        results.map((result) => {
          if (!result.geometry?.point) return undefined
          const [longitude, latitude] = result.geometry.point
          const addressMatches = result.label?.match(/(.+?), (.*)/)
          return {
            name: addressMatches?.[1],
            formattedAddress: addressMatches?.[2],
            coordinates: { latitude, longitude }
          }
        })
      )
    )
  }
}
