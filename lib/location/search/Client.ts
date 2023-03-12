import { ArrayUtils } from "@lib/Array"
import { Geo } from "aws-amplify"
import { Location } from "../Location"
import "react-native-get-random-values"
import "react-native-url-polyfill/auto"
import { AmplifyLocationSearchUtils } from "./AmplifyUtils"
import { LocationSearchResult } from "./Result"

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
        results.map(AmplifyLocationSearchUtils.placeToSearchResult)
      )
    )
  }
}
