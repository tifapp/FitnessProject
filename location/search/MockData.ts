import { ArrayUtils } from "@lib/utils/Array"
import { randomBool } from "@lib/utils/Random"
import { LocationCoordinate2D, TiFLocation } from "@location"
import {
  RecentLocationAnnotation,
  asyncStorageLoadRecentLocations
} from "./RecentsStorage"
import { LocationSearchResult, LocationsSearchQuery } from "./Models"
import { mockTiFLocation } from "@location/MockData"

/**
 * Creates a random {@link LocationSearchResultAnnotation}.
 */
export const mockLocationSearchAnnotation = () => {
  const annotation = randomBool() ? "attended-recently" : "hosted-recently"
  return annotation as RecentLocationAnnotation
}

/**
 * Mocks a {@link LocationSearchResult}.
 */
export const mockLocationSearchResult = (
  coordinates?: LocationCoordinate2D
) => {
  const isRecent = randomBool(0.8)
  return {
    location: mockTiFLocation(coordinates),
    annotation: isRecent ? mockLocationSearchAnnotation() : undefined,
    isRecentLocation: isRecent
  } as LocationSearchResult
}

/**
 *
 * @param coordinates
 * @returns A promise for a mocked array of LocationSearchResults.
 */
export const mockLocationSearchResultArray = async (
  coordinates?: LocationCoordinate2D[]
) => {
  return coordinates?.map((point) => mockLocationSearchResult(point))
}

/**
 *
 * @param coordinates
 * @returns A promise for a mocked array of TiFLocations.
 */
export const mockTiFLocationArray = async (
  coordinates?: LocationCoordinate2D[]
) => {
  return coordinates?.map((point) => mockTiFLocation(point))
}

export const mockLocationSearchFunction = async (
  query: LocationsSearchQuery
): Promise<TiFLocation[]> => {
  return ArrayUtils.compactMap(
    await asyncStorageLoadRecentLocations(10),
    (recentLocation) =>
      recentLocation.location.placemark.name?.includes(query.toString())
        ? {
          coordinates: recentLocation.location.coordinates,
          placemark: recentLocation.location.placemark
        }
        : undefined
  )
}
