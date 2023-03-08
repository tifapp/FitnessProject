import {
  AsyncStorageLocationSearchHistory,
  LocationSearchHistory
} from "@lib/location/search/History"
import AsyncStorage from "@react-native-async-storage/async-storage"

let searchHistory: LocationSearchHistory
describe("AsyncStorageLocationSearchHistory tests", () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] })
    searchHistory = new AsyncStorageLocationSearchHistory()
  })

  afterEach(() => jest.useRealTimers())

  it("should save a newly created result in async storage", async () => {
    jest.setSystemTime(new Date("2023-03-08T00:51:00"))
    const searchResult = {
      name: "Test",
      formattedAddress: "1234 Test Dr, Test City, Test State 12345",
      coordinates: { latitude: 45.12345, longitude: -121.12345 }
    }
    await searchHistory.save({ searchResult, reason: "attended-event" })

    const result = await AsyncStorage.getItem(
      "location.search.history.lat+45.12345.lng+-121.12345"
    )
    expect(JSON.parse(result!!)).toMatchObject({
      ...searchResult,
      history: [{ timestamp: 1678265460, reason: "attended-event" }]
    })
  })
})
