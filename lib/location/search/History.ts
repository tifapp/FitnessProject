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

export interface LocationSearchHistory {
  save: (options: LocationSearchHistorySaveOptions) => Promise<void>
}

export class AsyncStorageLocationSearchHistory
implements LocationSearchHistory {
  async save (options: LocationSearchHistorySaveOptions) {
    const result = {
      ...options.searchResult,
      history: [{ timestamp: now().unix(), reason: options.reason }]
    }
    await AsyncStorageUtils.save(
      searchHistoryKey(options.searchResult.coordinates),
      result
    )
  }
}

const searchHistoryKey = (coordinates: Location) => {
  return `location.search.history.lat+${coordinates.latitude}.lng+${coordinates.longitude}`
}
