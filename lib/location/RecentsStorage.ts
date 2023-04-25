import { z } from "zod"
import {
  Location,
  LocationCoordinate2D,
  LocationSchema,
  hashLocationCoordinate
} from "./Location"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ArrayUtils } from "@lib/Array"
import { AsyncStorageUtils } from "@lib/AsyncStorage"

/**
 * A zod schema for {@link RecentLocationAnnotationSchema}.
 */
export const RecentLocationAnnotationSchema = z.enum([
  "attended-event",
  "hosted-event"
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
 */
export type RecentLocationAnnotation = z.infer<
  typeof RecentLocationAnnotationSchema
>

/**
 * A zod schema for {@link RecentLocation}.
 */
export const RecentLocationSchema = z.object({
  location: LocationSchema,
  annotation: RecentLocationAnnotationSchema.optional()
})

/**
 * A type that contains recency data around a particular location.
 */
export type RecentLocation = z.infer<typeof RecentLocationSchema>

/**
 * Loads the specified amount of recent locations ordered by recency date descending.
 */
export const asyncStorageLoadRecentLocations = async (amount: number) => {
  const keylist = await loadRecentLocationsKeylist()
  return await recentLocationsWithKeys(keylist.slice(0, amount))
}

/**
 * Loads specific recent locations from async storage based on the given coordinates.
 */
export const asyncStorageLoadSpecificRecentLocations = async (
  coordinates: LocationCoordinate2D[]
) => {
  return await recentLocationsWithKeys(
    coordinates.map(recentLocationAsyncStorageKey)
  )
}

const recentLocationsWithKeys = async (keys: string[]) => {
  return await AsyncStorageUtils.multiParseItems(
    RecentLocationSchema,
    keys
  ).then((results) => {
    return ArrayUtils.removeOptionals(results.map(([_, value]) => value))
  })
}

/**
 * A function type for saving a location that the user has recently
 * interacted with.
 */
export type SaveRecentLocation = (
  selection: Location,
  annotation?: RecentLocationAnnotation
) => Promise<void>

/**
 * Saves a location to async storage with the given reason.
 */
export const asyncStorageSaveRecentLocation = async (
  location: Location,
  annotation?: RecentLocationAnnotation
) => {
  const key = recentLocationAsyncStorageKey(location.coordinates)
  const keylist = await loadRecentLocationsKeylist().then((keylist) =>
    keylist.filter((keylistKey) => keylistKey !== key)
  )

  // NB: Time only moves forward, so we can keep the list sorted by simply just
  // inserting at the start.
  keylist.unshift(key)

  await AsyncStorage.multiSet([
    [RECENT_LOCATIONS_KEYLIST_KEY, JSON.stringify(keylist)],
    [
      key,
      JSON.stringify({
        location,
        annotation
      })
    ]
  ])
}

const RECENT_LOCATIONS_KEYLIST_KEY = "@recent_locations_keys"

const RecentLocationsKeylistSchema = z.array(z.string())

const loadRecentLocationsKeylist = async () => {
  return await AsyncStorageUtils.parseItem(
    RecentLocationsKeylistSchema,
    RECENT_LOCATIONS_KEYLIST_KEY
  ).then((result) => result ?? [])
}

const recentLocationAsyncStorageKey = (coordinate: LocationCoordinate2D) => {
  return `@location_${hashLocationCoordinate(coordinate)}`
}
