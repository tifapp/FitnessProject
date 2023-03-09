import { AsyncStorageUtils } from "@lib/AsyncStorage"
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

const testSearchResult2 = {
  name: "Test 2",
  formattedAddress: "6789 Test Rd, Test Town, Test State 67890",
  coordinates: { latitude: 45.6789, longitude: -121.6789 }
} as const

let searchHistory: LocationSearchHistory

describe("AsyncStorageLocationSearchHistory tests", () => {
  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] })
    searchHistory = new AsyncStorageLocationSearchHistory()
    await AsyncStorage.clear()
  })

  afterEach(() => jest.useRealTimers())

  it("should save a newly created result in async storage with history based on the current date", async () => {
    jest.setSystemTime(new Date("2023-03-08T00:51:00"))
    await searchHistory.save(testSearchResult, { reason: "attended-event" })

    const result = await AsyncStorageUtils.load(testSearchResultKey)
    expect(result).toMatchObject({
      ...testSearchResult,
      history: [{ timestamp: 1678265460, reason: "attended-event" }]
    })
  })

  it("should append to the history when saved more than once", async () => {
    jest.setSystemTime(1000)
    await searchHistory.save(testSearchResult, { reason: "attended-event" })

    jest.setSystemTime(2000)
    await searchHistory.save(testSearchResult, { reason: "hosted-event" })

    const result = await AsyncStorageUtils.load(testSearchResultKey)
    expect(result).toMatchObject(
      expect.objectContaining({
        history: [
          { timestamp: 1, reason: "attended-event" },
          { timestamp: 2, reason: "hosted-event" }
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
    jest.setSystemTime(1000)
    await searchHistory.save(testSearchResult, { reason: "searched-location" })

    jest.setSystemTime(2000)
    await searchHistory.save(testSearchResult2, { reason: "hosted-event" })

    const itemMap = await searchHistory.itemsForLocations([
      testSearchResult.coordinates,
      testSearchResult2.coordinates
    ])

    expect(itemMap.item(testSearchResult.coordinates)).toEqual({
      ...testSearchResult,
      history: [{ timestamp: 1, reason: "searched-location" }]
    })

    expect(itemMap.item(testSearchResult2.coordinates)).toEqual({
      ...testSearchResult2,
      history: [{ timestamp: 2, reason: "hosted-event" }]
    })
  })

  it("should return undefined for a query on a non-existent history item", async () => {
    const itemMap = await searchHistory.itemsForLocations([
      testSearchResult.coordinates
    ])
    expect(itemMap.item(testSearchResult.coordinates)).toBeUndefined()
  })

  it("allows querying for the entire history with a limit", async () => {
    await saveFakeSearchResults(100)
    const items = await searchHistory.load({ limit: 45 })
    expect(items).toHaveLength(45)
  })

  it("allows querying for the entire history ordered by the most recent save date", async () => {
    jest.setSystemTime(1000)
    await searchHistory.save(testSearchResult, { reason: "searched-location" })

    jest.setSystemTime(2000)
    await searchHistory.save(testSearchResult2, { reason: "hosted-event" })

    jest.setSystemTime(3000)
    await searchHistory.save(testSearchResult, { reason: "attended-event" })

    const items = await searchHistory.load()
    expect(items).toMatchObject([
      {
        ...testSearchResult,
        history: [
          { timestamp: 1, reason: "searched-location" },
          { timestamp: 3, reason: "attended-event" }
        ]
      },
      {
        ...testSearchResult2,
        history: [{ timestamp: 2, reason: "hosted-event" }]
      }
    ])
  })
})

const saveFakeSearchResults = async (amount: number) => {
  await Promise.all(
    [...Array(amount).keys()].map(async (i) => {
      await searchHistory.save(
        {
          name: `Test ${i}`,
          formattedAddress: `${i} Test Dr, Test City, Test State ${i}`,
          coordinates: {
            latitude: 42 + i * 0.0001,
            longitude: -121 + i * 0.0001
          }
        },
        { reason: "attended-event" }
      )
    })
  )
}
