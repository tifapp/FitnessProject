import { AsyncStorageUtils } from "@lib/AsyncStorage"
import { LocationSearchResult } from "@lib/location/search"
import {
  AsyncStorageLocationSearchHistory,
  LocationSearchHistory
} from "@lib/location/search/History"
import AsyncStorage from "@react-native-async-storage/async-storage"

const testSearchResult = {
  name: "Test",
  formattedAddress: "1234 Test Dr, Test City, Test State 12345",
  coordinates: { latitude: 45.12345, longitude: -121.12345 }
} as const

const testSearchResultKey =
  "@location_search_history_lat+45.12345_lng+-121.12345"

let searchHistory: LocationSearchHistory

describe("AsyncStorageLocationSearchHistory tests", () => {
  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] })
    searchHistory = new AsyncStorageLocationSearchHistory()
    await AsyncStorage.clear()
  })

  afterEach(() => jest.useRealTimers())

  it("should save a newly created result in async storage", async () => {
    jest.setSystemTime(new Date("2023-03-08T00:51:00"))
    await searchHistory.save(testSearchResult, { reason: "attended-event" })

    const result = await AsyncStorageUtils.load(testSearchResultKey)
    expect(result).toMatchObject({
      ...testSearchResult,
      history: [{ timestamp: 1678265460, reason: "attended-event" }]
    })
  })

  it("should append to the history when saved more than once", async () => {
    jest.setSystemTime(new Date("2023-03-08T00:51:00"))
    await searchHistory.save(testSearchResult, { reason: "attended-event" })

    jest.setSystemTime(new Date("2023-03-09T00:51:00"))
    await searchHistory.save(testSearchResult, { reason: "hosted-event" })

    const result = await AsyncStorageUtils.load(testSearchResultKey)
    expect(result).toMatchObject(
      expect.objectContaining({
        history: [
          { timestamp: 1678265460, reason: "attended-event" },
          { timestamp: 1678351860, reason: "hosted-event" }
        ]
      })
    )
  })

  it("should update place info when saved", async () => {
    await searchHistory.save(testSearchResult, { reason: "attended-event" })
    await searchHistory.save(
      { ...testSearchResult, name: "Hello" },
      {
        reason: "hosted-event"
      }
    )
    const result = await AsyncStorageUtils.load(testSearchResultKey)
    expect(result).toMatchObject(expect.objectContaining({ name: "Hello" }))
  })

  it("should be able to query specific history items in batch", async () => {
    jest.setSystemTime(new Date("2023-03-08T00:51:00"))
    await searchHistory.save(testSearchResult, { reason: "searched-location" })

    const otherSearchResult = {
      ...testSearchResult,
      name: "Test 2",
      coordinates: { latitude: 43.1, longitude: -121.34 }
    }
    jest.setSystemTime(new Date("2023-03-09T00:51:00"))
    await searchHistory.save(otherSearchResult, { reason: "hosted-event" })

    const itemMap = await searchHistory.itemsForLocations([
      testSearchResult.coordinates,
      otherSearchResult.coordinates
    ])

    expect(itemMap.item(testSearchResult.coordinates)).toEqual({
      ...testSearchResult,
      history: [{ timestamp: 1678265460, reason: "searched-location" }]
    })

    expect(itemMap.item(otherSearchResult.coordinates)).toEqual({
      ...otherSearchResult,
      history: [{ timestamp: 1678351860, reason: "hosted-event" }]
    })
  })

  it("should return undefined for a query on a non-existent history item", async () => {
    const itemMap = await searchHistory.itemsForLocations([
      testSearchResult.coordinates
    ])
    expect(itemMap.item(testSearchResult.coordinates)).toBeUndefined()
  })
})
