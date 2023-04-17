import { randomBool } from "@lib/Random"
import { createDependencyKey } from "@lib/dependencies"
import { mockLocation, LocationCoordinate2D, Location } from "@lib/location"

/**
 * An annotation that appears above a location search result in the UI.
 */
export type LocationSearchAnnotation = "attended-recently" | "hosted-recently"

/**
 * Creates a random {@link LocationSearchAnnotation}.
 */
export const mockLocationSearchAnnotation = (): LocationSearchAnnotation => {
  return randomBool() ? "hosted-recently" : "hosted-recently"
}

/**
 * An option that is displayed by the location search.
 */
export type LocationSearchOption = {
  /**
   * The actual location presented by this option.
   */
  location: Location

  /**
   * An annotation that appears above this option.
   */
  annotation?: LocationSearchAnnotation

  /**
   * True if the option is a saved location in the user's
   * recent locations.
   */
  isRecentLocation: boolean
}

/**
 * Mocks a {@link LocationSearchOption}.
 */
export const mockLocationSearchOption = (): LocationSearchOption => ({
  location: mockLocation(),
  annotation: mockLocationSearchAnnotation(),
  isRecentLocation: randomBool()
})

/**
 * Saves a search selection made by the user in the location search process.
 */
export type SaveLocationSearchSelection = (selection: Location) => void

/**
 * Loads a set of {@link LocationSearchOption}s for the user to pick from based
 * on a query string and a center bias.
 *
 * If the query string is empty, a list of the user's recent locations will be
 * loaded.
 */
export type LoadLocationSearchOptions = (
  query: string,
  center?: LocationCoordinate2D
) => Promise<LocationSearchOption[]>

/**
 * Some dependency keys used by the location search UI.
 */
export namespace LocationSearchDependencyKeys {
  // TODO: - Live Value
  export const saveSelection =
    createDependencyKey<SaveLocationSearchSelection>()

  // TODO: - Live Value
  export const loadOptions = createDependencyKey<LoadLocationSearchOptions>()
}
