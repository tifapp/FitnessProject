import { ArrayUtils, NonEmptyArraySchema } from "@lib/Array"
import { AsyncStorageUtils } from "@lib/AsyncStorage"
import { now } from "@lib/date"
import { createDependencyKey } from "@lib/dependencies"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Location } from "../Location"
import { LocationSearchResult, LocationSearchResultSchema } from "./Result"
import { z } from "zod"

/**
 * A zod schema for {@link LocationSearchHistorySaveReason}.
 */
export const LocationSearchHistorySaveReasonSchema = z.enum([
  "attended-event",
  "hosted-event",
  "searched-location"
])

/**
 * Reason for saving an item in the search history.
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
export type LocationSearchHistorySaveReason = z.infer<
  typeof LocationSearchHistorySaveReasonSchema
>

/**
 * Configurable options when saving a {@link LocationSearchResult}.
 */
export type LocationSearchHistorySaveOptions = {
  /**
   * The reason for saving this result, which can be used to indicate
   * useful context behind history items to the user (eg. `"You recently hosted 3 events here"`).
   *
   * Defaults to `"searched-location"`
   */
  reason?: LocationSearchHistorySaveReason
}

/**
 * A zod schema for the {@link LocationSearchHistoryItemRecord}.
 */
export const LocationSearchHistoryItemRecordSchema = z.object({
  timestamp: z.number(),
  reason: LocationSearchHistorySaveReasonSchema
})

/**
 * A recorded history record in a {@link LocationSearchHistoryItem}.
 */
export type LocationSearchHistoryItemRecord = Readonly<
  z.infer<typeof LocationSearchHistoryItemRecordSchema>
>

/**
 * A zod schema for a {@link LocationSearchHistoryItem}.
 */
export const LocationSearchHistoryItemSchema =
  LocationSearchResultSchema.extend({
    history: NonEmptyArraySchema<LocationSearchHistoryItemRecord>(
      LocationSearchHistoryItemRecordSchema
    )
  })

/**
 * An item stored in the user's location search history.
 *
 * A history item contains its base search result, as well as everytime
 * and all the reasons that the result was saved in history.
 */
export type LocationSearchHistoryItem = Readonly<
  z.infer<typeof LocationSearchHistoryItemSchema>
>

/**
 * Some options for loading results from a `LocationSearchHistory`
 * instance.
 */
export type LocationSearchHistoryLoadOptions = {
  /**
   * Upper limits the number of results to this amount.
   */
  limit?: number
}

/**
 * A mapping of `LocationSearchHistoryItem`s to their respective location coordinates.
 */
export class LocationSearchHistoryItemMap {
  private readonly map: Map<string, LocationSearchHistoryItem>

  constructor (items: LocationSearchHistoryItem[]) {
    this.map = new Map(
      items.map((item) => [searchHistoryKey(item.coordinates), item])
    )
  }

  /**
   * Retrieves the item that has the given coordinates, or returns undefined
   * if not available.
   */
  item (location: Location) {
    return this.map.get(searchHistoryKey(location))
  }
}

/**
 * An interface for accessing the user's location search history.
 */
export interface LocationSearchHistory {
  /**
   * Loads all history items sorted by the most recently saved item timestamp
   * in descending order.
   *
   * @param options see {@link LocationSearchHistoryLoadOptions}
   */
  loadItems: (
    options?: LocationSearchHistoryLoadOptions
  ) => Promise<LocationSearchHistoryItem[]>

  /**
   * Saves a given search result and appends to its existing history array, or creates
   * it if this is a new search result.
   */
  saveSearchResult: (
    searchResult: LocationSearchResult,
    options?: LocationSearchHistorySaveOptions
  ) => Promise<void>

  /**
   * Retrieves the history items for a given array of locations.
   *
   * @returns a mapping of location coordinates to the respective items
   */
  itemsForLocations: (
    locations: Location[]
  ) => Promise<LocationSearchHistoryItemMap>
}

/**
 * A {@link LocationSearchHistory} instance backed by a {@link AsyncStorage}.
 */
export class AsyncStorageLocationSearchHistory
implements LocationSearchHistory {
  async loadItems (options?: LocationSearchHistoryLoadOptions) {
    const items = await this.historyItemsForKeys(await this.allKeys()).then(
      (items) =>
        items.sort((item1, item2) => {
          const item1History = ArrayUtils.lastElementNonEmpty(item1.history)
          const item2History = ArrayUtils.lastElementNonEmpty(item2.history)
          return item2History.timestamp - item1History.timestamp
        })
    )
    return options?.limit ? items.splice(0, options.limit) : items
  }

  async itemsForLocations (locations: Location[]) {
    const keys = locations.map((coordinates) => searchHistoryKey(coordinates))
    return await this.historyItemsForKeys(keys).then(
      (items) => new LocationSearchHistoryItemMap(items)
    )
  }

  async saveSearchResult (
    searchResult: LocationSearchResult,
    options?: LocationSearchHistorySaveOptions
  ) {
    const historyItem = await this.itemsForLocations([
      searchResult.coordinates
    ]).then((map) => map.item(searchResult.coordinates))
    await AsyncStorageUtils.save(searchHistoryKey(searchResult.coordinates), {
      ...searchResult,
      history: [
        ...(historyItem?.history ?? []),
        {
          timestamp: now().unix(),
          reason: options?.reason ?? "searched-location"
        }
      ]
    })
  }

  private async allKeys () {
    return await AsyncStorage.getAllKeys().then((keys) =>
      keys.filter(isSearchHistoryKey)
    )
  }

  private async historyItemsForKeys (keys: string[]) {
    return await AsyncStorage.multiGet(keys).then((results) => {
      return ArrayUtils.removeOptionals(
        results.map(([_, value]) => parseStoredHistoryItem(value))
      )
    })
  }
}

/**
 * A `DependencyKey` for a {@link LocationSearchHistory} instance.
 */
export const locationSearchHistoryDependencyKey =
  createDependencyKey<LocationSearchHistory>(
    new AsyncStorageLocationSearchHistory()
  )

const isSearchHistoryKey = (key: string) => {
  return key.match(
    /^@location_search_history_lat\+[+-]?([0-9]*[.])?[0-9]+_lng\+[+-]?([0-9]*[.])?[0-9]+$/
  )
}

const searchHistoryKey = (coordinates: Location) => {
  return `@location_search_history_lat+${coordinates.latitude}_lng+${coordinates.longitude}`
}

const parseStoredHistoryItem = (historyItemString: string | null) => {
  try {
    if (!historyItemString) return undefined
    return LocationSearchHistoryItemSchema.parse(JSON.parse(historyItemString))
  } catch {
    return undefined
  }
}
