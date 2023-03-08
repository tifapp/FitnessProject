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
  "location.search.history.lat+45.12345.lng+-121.12345"

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
    await searchHistory.save({
      searchResult: testSearchResult,
      reason: "attended-event"
    })

    const result = await AsyncStorageUtils.load(testSearchResultKey)
    expect(result).toMatchObject({
      ...testSearchResult,
      history: [{ timestamp: 1678265460, reason: "attended-event" }]
    })
  })

  it("should append to the history when saved more than once", async () => {
    jest.setSystemTime(new Date("2023-03-08T00:51:00"))
    await searchHistory.save({
      searchResult: testSearchResult,
      reason: "attended-event"
    })
    jest.setSystemTime(new Date("2023-03-09T00:51:00"))
    await searchHistory.save({
      searchResult: testSearchResult,
      reason: "hosted-event"
    })
    const result = await AsyncStorageUtils.load(testSearchResultKey)
    expect(result).toMatchObject({
      ...testSearchResult,
      history: [
        { timestamp: 1678265460, reason: "attended-event" },
        { timestamp: 1678351860, reason: "hosted-event" }
      ]
    })
  })
})
