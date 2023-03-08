import { AsyncStorageUtils } from "@lib/AsyncStorage"
import { now } from "@lib/date"
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

export interface LocationSearchHistory {
  save: (options: LocationSearchHistorySaveOptions) => Promise<void>
  itemForLocation: (
    coordinates: Location
  ) => Promise<LocationSearchHistoryItem | undefined>
}

export class AsyncStorageLocationSearchHistory
implements LocationSearchHistory {
  async itemForLocation (coordinates: Location) {
    return await AsyncStorageUtils.load<LocationSearchHistoryItem>(
      searchHistoryKey(coordinates)
    ).then((res) => res ?? undefined)
  }

  async save (options: LocationSearchHistorySaveOptions) {
    const historyItem = await this.itemForLocation(
      options.searchResult.coordinates
    )
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
