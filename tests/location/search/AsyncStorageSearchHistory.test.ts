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
    jest.setSystemTime(new Date("2023-03-08T00:51:00Z"))
    await searchHistory.saveSearchResult(testSearchResult, {
      reason: "attended-event"
    })

    const saved = await AsyncStorageUtils.load(testSearchResultKey)
    expect(saved).toMatchObject({
      ...testSearchResult,
      history: [{ timestamp: 1678236660, reason: "attended-event" }]
    })
  })

  it("should append to the history when saved more than once", async () => {
    jest.setSystemTime(new Date("2023-03-04T00:51:00Z"))
    await searchHistory.saveSearchResult(testSearchResult, {
      reason: "attended-event"
    })

    jest.setSystemTime(new Date("2023-03-05T00:51:00Z"))
    await searchHistory.saveSearchResult(testSearchResult, {
      reason: "hosted-event"
    })

    const saved = await AsyncStorageUtils.load(testSearchResultKey)
    expect(saved).toMatchObject(
      expect.objectContaining({
        history: [
          { timestamp: 1677891060, reason: "attended-event" },
          { timestamp: 1677977460, reason: "hosted-event" }
        ]
      })
    )
  })

  it("should update place info when saved", async () => {
    await searchHistory.saveSearchResult(testSearchResult)
    await searchHistory.saveSearchResult({ ...testSearchResult, name: "Hello" })
    const result = await AsyncStorageUtils.load(testSearchResultKey)
    expect(result).toMatchObject(expect.objectContaining({ name: "Hello" }))
  })

  it("should be able to query specific history items in batch", async () => {
    jest.setSystemTime(1000)
    await searchHistory.saveSearchResult(testSearchResult)

    jest.setSystemTime(2000)
    await searchHistory.saveSearchResult(testSearchResult2)

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
      history: [{ timestamp: 2, reason: "searched-location" }]
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
    expect(await searchHistory.loadItems({ limit: 45 })).toHaveLength(45)
  })

  it("allows querying for the entire history with a limit greater than the amount of stored history items", async () => {
    await saveFakeSearchResults(10)
    expect(await searchHistory.loadItems({ limit: 45 })).toHaveLength(10)
  })

  it("allows querying for the entire history ordered by the most recent save date", async () => {
    jest.setSystemTime(1000)
    await searchHistory.saveSearchResult(testSearchResult, {
      reason: "searched-location"
    })

    jest.setSystemTime(2000)
    await searchHistory.saveSearchResult(testSearchResult2, {
      reason: "hosted-event"
    })

    jest.setSystemTime(3000)
    await searchHistory.saveSearchResult(testSearchResult, {
      reason: "attended-event"
    })

    expect(await searchHistory.loadItems()).toMatchObject([
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

  it("should ignore non-location search history keys in AsyncStorage when querying all items", async () => {
    await AsyncStorageUtils.save("test", 1)
    await saveFakeSearchResults(10)
    expect(await searchHistory.loadItems()).not.toContain(1)
  })

  it("should ignore search results that are invalid json strings when querying all items", async () => {
    await AsyncStorage.setItem(testSearchResultKey, corruptedJSONString)
    expect(await searchHistory.loadItems()).toHaveLength(0)
  })

  it("should ignore invalid formatted search results when querying all items", async () => {
    await AsyncStorageUtils.save(testSearchResultKey, {
      name: 5,
      formattedAddress: true,
      history: []
    })
    expect(await searchHistory.loadItems()).toHaveLength(0)
  })

  it("should ignore search results that are invalid json strings when querying specific items", async () => {
    await AsyncStorage.setItem(testSearchResultKey, corruptedJSONString)
    const itemMap = await searchHistory.itemsForLocations([
      testSearchResult.coordinates
    ])
    expect(itemMap.item(testSearchResult.coordinates)).toBeUndefined()
  })

  it("should ignore invalid formatted search results when querying specific items", async () => {
    await AsyncStorageUtils.save(testSearchResultKey, {
      name: true,
      formattedAddress: false,
      history: "Hello world"
    })
    const itemMap = await searchHistory.itemsForLocations([
      testSearchResult.coordinates
    ])
    expect(itemMap.item(testSearchResult.coordinates)).toBeUndefined()
  })
})

const corruptedJSONString =
  "{ \"data\": \"L33T H4CK3R has corrupted this data and the JSON is invalid! Please send 4,000,000 bitcoin the resove this issue!\""

const saveFakeSearchResults = async (amount: number) => {
  await Promise.all(
    [...Array(amount).keys()].map(async (i) => {
      await searchHistory.saveSearchResult({
        name: `Test ${i}`,
        formattedAddress: `${i} Test Dr, Test City, Test State ${i}`,
        coordinates: {
          latitude: 42 + i * 0.0001,
          longitude: -121 + i * 0.0001
        }
      })
    })
  )
}
