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

export type LocationSearchHistoryRecord = {
  history: [{ timestamp: number; reason: LocationSearchHistorySaveReason }]
} & LocationSearchResult

export interface LocationSearchHistory {
  save: (options: LocationSearchHistorySaveOptions) => Promise<void>
}

export class AsyncStorageLocationSearchHistory
implements LocationSearchHistory {
  async save (options: LocationSearchHistorySaveOptions) {
    const key = searchHistoryKey(options.searchResult.coordinates)
    const prevHistory =
      await AsyncStorageUtils.load<LocationSearchHistoryRecord>(key).then(
        (res) => res?.history ?? []
      )
    const result = {
      ...options.searchResult,
      history: [
        ...prevHistory,
        { timestamp: now().unix(), reason: options.reason }
      ]
    }
    await AsyncStorageUtils.save(key, result)
  }
}

const searchHistoryKey = (coordinates: Location) => {
  return `location.search.history.lat+${coordinates.latitude}.lng+${coordinates.longitude}`
}
