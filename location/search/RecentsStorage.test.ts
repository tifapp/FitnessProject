import { mockTiFLocation } from "@location/MockData"
import {
  asyncStorageLoadRecentLocations,
  asyncStorageLoadSpecificRecentLocations,
  asyncStorageSaveRecentLocation
} from "./RecentsStorage"
import AsyncStorage from "@react-native-async-storage/async-storage"

const TEST_COORDINATES = { latitude: 41.1234, longitude: -121.1234 }
const TEST_COORDINATES_STORAGE_KEY = "@location_9r3cgy29h"

describe("RecentLocationStorage tests", () => {
  beforeEach(async () => await AsyncStorage.clear())

  describe("AsyncStorageSaveRecentLocation tests", () => {
    it("should save the location in async storage", async () => {
      const location = mockTiFLocation(TEST_COORDINATES)

      await asyncStorageSaveRecentLocation(location, "attended-event")
      const savedLocation = JSON.parse(
        (await AsyncStorage.getItem(TEST_COORDINATES_STORAGE_KEY))!
      )
      expect(savedLocation).toMatchObject({
        location,
        annotation: "attended-event"
      })
    })
  })

  describe("AsyncStorageLoadSpecificRecentLocations tests", () => {
    it("should be able to retrieve multiple saved locations", async () => {
      const location1 = mockTiFLocation()
      const location2 = mockTiFLocation()
      const location3 = mockTiFLocation()
      await asyncStorageSaveRecentLocation(location1, "attended-event")
      await asyncStorageSaveRecentLocation(location2, "hosted-event")

      const results = await asyncStorageLoadSpecificRecentLocations([
        location1.coordinates,
        location2.coordinates,
        location3.coordinates
      ])
      expect(results).toEqual([
        expect.objectContaining({
          location: location1,
          annotation: "attended-event"
        }),
        expect.objectContaining({
          location: location2,
          annotation: "hosted-event"
        })
      ])
    })

    it("filters invalidly persisted locations", async () => {
      await AsyncStorage.setItem(TEST_COORDINATES_STORAGE_KEY, "sdkjcudsb")
      expect(
        await asyncStorageLoadSpecificRecentLocations([TEST_COORDINATES])
      ).toHaveLength(0)
    })
  })

  describe("AsyncStorageLoadRecentLocations tests", () => {
    it("should load recent locations ordered by most recently saved", async () => {
      const location1 = mockTiFLocation()
      const location2 = mockTiFLocation()
      const location3 = mockTiFLocation()

      await asyncStorageSaveRecentLocation(location1)
      await asyncStorageSaveRecentLocation(location2, "hosted-event")
      await asyncStorageSaveRecentLocation(location3, "attended-event")
      await asyncStorageSaveRecentLocation(location1)

      const results = await asyncStorageLoadRecentLocations(2)
      expect(results).toEqual([
        {
          location: location1,
          annotation: undefined
        },
        {
          location: location3,
          annotation: "attended-event"
        }
      ])
    })

    it("is empty when no recent locations", async () => {
      expect(await asyncStorageLoadRecentLocations(100)).toHaveLength(0)
    })

    it("filters invalidly persisted locations", async () => {
      // NB: Ensure this location appears in the keylist.
      await asyncStorageSaveRecentLocation(mockTiFLocation(TEST_COORDINATES))
      await AsyncStorage.setItem(TEST_COORDINATES_STORAGE_KEY, "sdkjcudsb")
      expect(await asyncStorageLoadRecentLocations(10)).toHaveLength(0)
    })
  })
})
