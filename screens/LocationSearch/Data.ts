import { randomBool } from "@lib/Random"
import { createDependencyKey } from "@lib/dependencies"
import { mockLocation, LocationCoordinate2D, Location } from "@lib/location"

/**
 * An annotation that appears above a location search result in the UI.
 */
export type LocationSearchResultAnnotation =
  | "attended-recently"
  | "hosted-recently"

/**
 * Creates a random {@link LocationSearchResultAnnotation}.
 */
export const mockLocationSearchAnnotation = () => {
  const annotation = randomBool() ? "attended-recently" : "hosted-recently"
  return annotation as LocationSearchResultAnnotation
}

/**
 * An option that is displayed by the location search.
 */
export type LocationSearchResult = {
  /**
   * The actual location presented by this option.
   */
  location: Location

  /**
   * An annotation that appears above this option.
   */
  annotation?: LocationSearchResultAnnotation

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
 * Saves a search selection made by the user in the location search picker.
 */
export type SaveLocationSearchPickerSelection = (
  selection: Location
) => Promise<void>

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

/**
 * Some dependency keys used by the location search UI.
 */
export namespace LocationSearchDependencyKeys {
  // TODO: - Live Value
  export const savePickerSelection =
    createDependencyKey<SaveLocationSearchPickerSelection>()

  // TODO: - Live Value
  export const searchForResults =
    createDependencyKey<LoadLocationSearchResults>()
}
