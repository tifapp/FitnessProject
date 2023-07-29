import { randomBool } from "@lib/Random"
import { TiFLocation, LocationCoordinate2D, mockLocation } from "./Location"
import { RecentLocationAnnotation } from "./RecentsStorage"

/**
 * Creates a random {@link LocationSearchResultAnnotation}.
 */
export const mockLocationSearchAnnotation = () => {
  const annotation = randomBool() ? "attended-recently" : "hosted-recently"
  return annotation as RecentLocationAnnotation
}

/**
 * An result that is displayed by the location search.
 */
export type LocationSearchResult = {
  /**
   * The actual location presented by this option.
   */
  location: TiFLocation

  /**
   * An annotation that appears above this option.
   */
  annotation?: RecentLocationAnnotation

  /**
   * True if the option is a saved location in the user's
   * recent locations.
   */
  isRecentLocation: boolean
}

/**
 * Mocks a {@link LocationSearchResult}.
 */
export const mockLocationSearchResult = (
  coordinates?: LocationCoordinate2D
) => {
  const isRecent = randomBool(0.8)
  return {
    location: mockLocation(coordinates),
    annotation: isRecent ? mockLocationSearchAnnotation() : undefined,
    isRecentLocation: isRecent
  } as LocationSearchResult
}

/**
 * Loads a set of {@link LocationSearchResult}s for the user to pick from based
 * on a query string and a center bias.
 *
 * If the query string is empty, a list of the user's recent locations will be
 * loaded.
 */
export type LoadLocationSearchResults = (
  query: string,
  center?: LocationCoordinate2D
) => Promise<LocationSearchResult[]>
