import {
  mockLocation,
  asyncStorageLoadRecentLocations,
  asyncStorageLoadSpecificRecentLocations,
  asyncStorageSaveRecentLocation
} from "@lib/location"
import AsyncStorage from "@react-native-async-storage/async-storage"

describe("RecentLocationStorage tests", () => {
  beforeEach(async () => await AsyncStorage.clear())

  describe("AsyncStorageSaveRecentLocation tests", () => {
    it("should save the location in async storage", async () => {
      const location = mockLocation({ latitude: 41.1234, longitude: -121.1234 })

      await asyncStorageSaveRecentLocation(location, "attended-event")
      const savedLocation = JSON.parse(
        (await AsyncStorage.getItem("@location_9r3cgy29h"))!
      )
      expect(savedLocation).toMatchObject({
        location,
        annotation: "attended-event"
      })
    })
  })

  describe("AsyncStorageLoadSpecificRecentLocations tests", () => {
    it("should be able to retrieve multiple saved locations", async () => {
      const location1 = mockLocation()
      const location2 = mockLocation()
      const location3 = mockLocation()
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
      await AsyncStorage.setItem("@location_9r3cgy29h", "sdkjcudsb")
      expect(
        await asyncStorageLoadSpecificRecentLocations([
          { latitude: 41.1234, longitude: -121.1234 }
        ])
      ).toHaveLength(0)
    })
  })

  describe("AsyncStorageLoadRecentLocations tests", () => {
    it("should load recent locations ordered by most recent", async () => {
      const location1 = mockLocation()
      const location2 = mockLocation()
      const location3 = mockLocation()

      await asyncStorageSaveRecentLocation(location1)
      await asyncStorageSaveRecentLocation(location2, "hosted-event")
      await asyncStorageSaveRecentLocation(location3, "attended-event")

      const results = await asyncStorageLoadRecentLocations(2)
      expect(results).toEqual([
        {
          location: location3,
          annotation: "attended-event"
        },
        {
          location: location2,
          annotation: "hosted-event"
        }
      ])
    })

    it("is empty when no recent locations", async () => {
      expect(await asyncStorageLoadRecentLocations(100)).toHaveLength(0)
    })

    it("filters invalidly persisted locations", async () => {
      // NB: Ensure this location appears in the keylist.
      await asyncStorageSaveRecentLocation(
        mockLocation({ latitude: 41.1234, longitude: -121.1234 })
      )
      await AsyncStorage.setItem("@location_9r3cgy29h", "sdkjcudsb")
      expect(await asyncStorageLoadRecentLocations(10)).toHaveLength(0)
    })
  })
})
