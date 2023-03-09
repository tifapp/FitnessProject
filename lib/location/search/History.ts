import { ArrayUtils, NonEmptyArray } from "@lib/Array"
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
  reason: LocationSearchHistorySaveReason
}

export type LocationSearchHistoryItem = {
  history: NonEmptyArray<{
    timestamp: number
    reason: LocationSearchHistorySaveReason
  }>
} & LocationSearchResult

export type LocationSearchHistoryLoadOptions = {
  limit?: number
}

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
  load: (
    options?: LocationSearchHistoryLoadOptions
  ) => Promise<LocationSearchHistoryItem[]>
  save: (
    searchResult: LocationSearchResult,
    options: LocationSearchHistorySaveOptions
  ) => Promise<void>
  itemsForLocations: (
    locations: Location[]
  ) => Promise<LocationSearchHistoryItemMap>
}

export class AsyncStorageLocationSearchHistory
implements LocationSearchHistory {
  async load (options?: LocationSearchHistoryLoadOptions) {
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

  private async allKeys () {
    return await AsyncStorage.getAllKeys().then((keys) =>
      keys.filter(isSearchHistoryKey)
    )
  }

  async itemsForLocations (locations: Location[]) {
    const keys = locations.map((coordinates) => searchHistoryKey(coordinates))
    return await this.historyItemsForKeys(keys).then(
      (items) => new LocationSearchHistoryItemMap(items)
    )
  }

  private async historyItemsForKeys (keys: string[]) {
    return await AsyncStorage.multiGet(keys).then((results) => {
      return ArrayUtils.takeNonNulls(results.map(([_, value]) => value)).map(
        (value) => JSON.parse(value) as LocationSearchHistoryItem
      )
    })
  }

  async save (
    searchResult: LocationSearchResult,
    options: LocationSearchHistorySaveOptions
  ) {
    const historyItem = await this.itemsForLocations([
      searchResult.coordinates
    ]).then((map) => map.item(searchResult.coordinates))
    await AsyncStorageUtils.save(searchHistoryKey(searchResult.coordinates), {
      ...searchResult,
      history: [
        ...(historyItem?.history ?? []),
        { timestamp: now().unix(), reason: options.reason }
      ]
    })
  }
}

const isSearchHistoryKey = (key: string) => {
  return key.match(
    /^@location_search_history_lat\+[+-]?([0-9]*[.])?[0-9]+_lng\+[+-]?([0-9]*[.])?[0-9]+$/
  )
}

const searchHistoryKey = (coordinates: Location) => {
  return `@location_search_history_lat+${coordinates.latitude}_lng+${coordinates.longitude}`
}
