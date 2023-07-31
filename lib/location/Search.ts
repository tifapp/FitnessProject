import { randomBool } from "@lib/Random"
import { TiFLocation, LocationCoordinate2D, mockTiFLocation } from "./Location"
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
    location: mockTiFLocation(coordinates),
    annotation: isRecent ? mockLocationSearchAnnotation() : undefined,
    isRecentLocation: isRecent
  } as LocationSearchResult
}

/**
 * A type that denotes whether searching for locations should utilize the user's
 * recent locations, or a remote service.
 */
export type LocationsSearchSourceType = "user-recents" | "remote-search"

/**
 * A rich query type that carries user-entered text for searching locations.
 */
export class LocationsSearchQuery {
  private readonly rawValue: string

  constructor (rawValue: string) {
    this.rawValue = rawValue
  }

  /**
   * The data source type of this query. An empty string means loading from
   * the user's recent locations.
   */
  get sourceType (): LocationsSearchSourceType {
    return this.rawValue.length === 0 ? "user-recents" : "remote-search"
  }

  toString () {
    return this.rawValue
  }
}

/**
 * Loads a set of {@link LocationSearchResult}s for the user to pick from based
 * on a query string and a center bias.
 *
 * If the query string is empty, a list of the user's recent locations will be
 * loaded.
 */
export type LoadLocationSearchResults = (
  query: LocationsSearchQuery,
  center?: LocationCoordinate2D
) => Promise<LocationSearchResult[]>
