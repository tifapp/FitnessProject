import { createDependencyKey } from "@lib/dependencies"
import {
  LoadLocationSearchResults,
  SaveRecentLocation,
  asyncStorageSaveRecentLocation
} from "@lib/location"
/**
 * Some dependency keys used by the location search UI.
 */
export namespace LocationSearchDependencyKeys {
  export const savePickerSelection = createDependencyKey<SaveRecentLocation>(
    () => asyncStorageSaveRecentLocation
  )

  // TODO: - Live Value
  export const searchForResults =
    createDependencyKey<LoadLocationSearchResults>()
}
