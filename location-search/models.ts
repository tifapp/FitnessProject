import { TiFLocation } from "../lib/location/Location"
import { RecentLocationAnnotation } from "./RecentsStorage"

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
 * Result data for the location search picker.
 */
export type LocationSearchResultsData =
  | {
      status: "loading"
      data: undefined
    }
  | { status: "no-results"; data: [] }
  | { status: "error"; data: undefined }
  | { status: "success"; data: LocationSearchResult[] }

/**
 * A type that denotes whether searching for locations should utilize the user's
 * recent locations, or a remote service.
 */
export type LocationsSearchSourceType = "user-recents" | "remote-search"

/**
 * A rich query type that carries user-entered text for searching locations.
 */
export class LocationsSearchQuery {
  /**
   * A {@link LocationsSearchQuery} that is initialized with an empty string.
   */
  static empty = new LocationsSearchQuery("")

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
