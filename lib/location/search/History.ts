import { ArrayUtils } from "@lib/Array"
import { AsyncStorageUtils } from "@lib/AsyncStorage"
import { now } from "@lib/date"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Location } from "../Location"
import { LocationSearchResult } from "./SearchResult"

export type LocationSearchHistorySaveReason =
  | "attended-event"
  | "hosted-event"
  | "searched-location"

export type LocationSearchHistorySaveOptions = {
  searchResult: LocationSearchResult
  reason: LocationSearchHistorySaveReason
}

export type LocationSearchHistoryItem = {
  history: [{ timestamp: number; reason: LocationSearchHistorySaveReason }]
} & LocationSearchResult

export class LocationSearchHistoryItemMap {
  private readonly map: Map<string, LocationSearchHistoryItem>

  constructor (items: LocationSearchHistoryItem[]) {
    this.map = new Map(
      items.map((item) => [searchHistoryKey(item.coordinates), item])
    )
  }

  item (location: Location) {
    return this.map.get(searchHistoryKey(location))
  }
}

export interface LocationSearchHistory {
  save: (options: LocationSearchHistorySaveOptions) => Promise<void>
  itemsForLocations: (
    locations: Location[]
  ) => Promise<LocationSearchHistoryItemMap>
}

export class AsyncStorageLocationSearchHistory
implements LocationSearchHistory {
  async itemsForLocations (locations: Location[]) {
    const keys = locations.map((coordinates) => searchHistoryKey(coordinates))
    return await AsyncStorage.multiGet(keys).then((results) => {
      const nonNullResults = ArrayUtils.takeNonNulls(
        results.map(([_, value]) => value)
      )
      return new LocationSearchHistoryItemMap(
        nonNullResults.map((value) => JSON.parse(value))
      )
    })
  }

  async save (options: LocationSearchHistorySaveOptions) {
    const historyItem = await this.itemsForLocations([
      options.searchResult.coordinates
    ]).then((map) => map.item(options.searchResult.coordinates))
    await AsyncStorageUtils.save(
      searchHistoryKey(options.searchResult.coordinates),
      {
        ...options.searchResult,
        history: [
          ...(historyItem?.history ?? []),
          { timestamp: now().unix(), reason: options.reason }
        ]
      }
    )
  }
}

const searchHistoryKey = (coordinates: Location) => {
  return `@location_search_history_lat+${coordinates.latitude}_lng+${coordinates.longitude}`
}
