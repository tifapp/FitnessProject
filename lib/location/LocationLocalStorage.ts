import { z } from "zod"
import {
  Location,
  LocationCoordinate2D,
  hashLocationCoordinate
} from "./Location"
import { AsyncStorageUtils } from "@lib/AsyncStorage"
import { now } from "@lib/date"

/**
 * A zod schema for {@link SaveLocationReasonSchema}.
 */
export const SaveLocationReasonSchema = z.enum([
  "attended-event",
  "hosted-event",
  "searched-location"
])

/**
 * Reason for saving a location in the location storage.
 *
 * This is mainly meant for use cases in which some status indicator can
 * be shown on top of a history item, indicating some context to the
 * user about the result (eg. `"You recently hosted 3 events here"`).
 *
 * ### Available Options
 * - `"attended-event"`
 *    - Use this when the user joins an event
 * - `"hosted-event"`
 *    - Use this when the user creates an event
 * - `"searched-location"` (default option)
 *    - Use this when the user selects a location from the location search screen
 */
export type SaveLocationReason = z.infer<typeof SaveLocationReasonSchema>

/**
 * Saves a location to async storage with the given reason.
 */
export const asyncStorageSaveLocation = async (
  location: Location,
  reason: SaveLocationReason = "searched-location",
  save: <T>(key: string, value: T) => Promise<void> = AsyncStorageUtils.save
) => {
  await save(createRecentLocationKey(location.coordinates), {
    ...location,
    timestamp: now().unix(),
    reason
  })
}

const createRecentLocationKey = (coordinate: LocationCoordinate2D) => {
  return `@location_${hashLocationCoordinate(coordinate)}`
}
