import * as AmplifyGeo from "@aws-amplify/geo"
import { LocationSearchResult } from "./Result"

export namespace AmplifyLocationSearchUtils {
  /**
   * Attempts to convert a {@link AmplifyGeo.Place} from amplify geo to a
   * {@link LocationSearchResult}.
   *
   * The returned search result name is the first address component of the
   * input's `label` property, with the formatted address being the remainder
   * of the string.
   *
   * If the place has no geometry, this function returns undefined.
   */
  export const placeToSearchResult = (place: AmplifyGeo.Place) => {
    if (!place.geometry) return undefined
    const [longitude, latitude] = place.geometry.point
    const splits = place.label?.split(ADDRESS_SPLIT_DELIMETER)
    const placeholderAddress = splits ? "Country" : undefined
    return {
      name: splits?.[0],
      formattedAddress:
        splits?.length === 1
          ? placeholderAddress
          : splits?.slice(1).join(ADDRESS_SPLIT_DELIMETER),
      coordinates: { latitude, longitude }
    } as LocationSearchResult
  }

  const ADDRESS_SPLIT_DELIMETER = ", "
}
