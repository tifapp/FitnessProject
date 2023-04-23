import { z } from "zod"
import {
  Location,
  LocationCoordinate2D,
  LocationSchema,
  hashLocationCoordinate
} from "./Location"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ArrayUtils } from "@lib/Array"
import { now } from "@lib/date"

/**
 * A zod schema for {@link RecentLocationAnnotationSchema}.
 */
export const RecentLocationAnnotationSchema = z.enum([
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
export type RecentLocationAnnotation = z.infer<
  typeof RecentLocationAnnotationSchema
>

const PersistedRecentLocationSchema = z
  .object({
    location: LocationSchema,
    annotation: RecentLocationAnnotationSchema,
    timestamp: z.number()
  })
  .transform((result) => ({
    location: result.location,
    annotation: result.annotation,
    date: new Date(result.timestamp * 1000)
  }))

/**
 * A type that contains recency data around a particular location.
 */
export type RecentLocation = Readonly<
  z.infer<typeof PersistedRecentLocationSchema>
>

/**
 * Loads specific recent locations from async storage based on the given coordinates.
 */
export const asyncStorageLoadSpecificRecentLocations = async (
  coordinates: LocationCoordinate2D[]
) => {
  return ArrayUtils.removeOptionals(
    await AsyncStorage.multiGet(coordinates.map(createRecentLocationKey)).then(
      (results) =>
        results.map(([_, locationJSON]) => {
          try {
            if (!locationJSON) return undefined
            return PersistedRecentLocationSchema.parse(JSON.parse(locationJSON))
          } catch {
            return undefined
          }
        })
    )
  )
}

/**
 * Saves a location to async storage with the given reason.
 */
export const asyncStorageSaveRecentLocation = async (
  location: Location,
  annotation: RecentLocationAnnotation = "searched-location"
) => {
  await AsyncStorage.setItem(
    createRecentLocationKey(location.coordinates),
    JSON.stringify({
      location,
      timestamp: now().unix(),
      annotation
    })
  )
}

const createRecentLocationKey = (coordinate: LocationCoordinate2D) => {
  return `@location_${hashLocationCoordinate(coordinate)}`
}
