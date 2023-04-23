import { mockLocation } from "@lib/location"
import {
  asyncStorageLoadSpecificRecentLocations,
  asyncStorageSaveRecentLocation
} from "@lib/location/RecentLocationStorage"
import { fakeTimers } from "../helpers/Timers"
import AsyncStorage from "@react-native-async-storage/async-storage"

describe("RecentLocationStorage tests", () => {
  fakeTimers()
  beforeEach(() => AsyncStorage.clear())

  describe("AsyncStorageSaveRecentLocation tests", () => {
    it("should save the location in async storage", async () => {
      jest.setSystemTime(new Date("2023-04-21T00:00:00"))
      const location = mockLocation({ latitude: 41.1234, longitude: -121.1234 })

      await asyncStorageSaveRecentLocation(location, "attended-event")
      const savedLocation = JSON.parse(
        (await AsyncStorage.getItem("@location_9r3cgy29h"))!
      )
      expect(savedLocation).toMatchObject({
        location,
        timestamp: 1682060400,
        annotation: "attended-event"
      })
    })
  })

  describe("AsyncStorageLoadSpecificRecentLocations tests", () => {
    it("should be able to retrieve multiple saved locations", async () => {
      const currentDate = new Date("2023-04-21T00:00:00")
      jest.setSystemTime(currentDate)
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
          annotation: "attended-event",
          date: currentDate
        }),
        expect.objectContaining({
          location: location2,
          annotation: "hosted-event",
          date: currentDate
        })
      ])
    })

    it("should ignore location data that is corrupted", async () => {
      await AsyncStorage.setItem(
        "@location_9r3cgy29h",
        "{ L33T_H4CK3R has corrupted this data!!!"
      )
      const results = await asyncStorageLoadSpecificRecentLocations([
        { latitude: 41.1234, longitude: -121.1234 }
      ])
      expect(results).toHaveLength(0)
    })

    it("should ignore location data with invalid properties", async () => {
      await AsyncStorage.setItem(
        "@location_9r3cgy29h",
        `
          { 
            "coordinates": { 
              "latitude": 41.1234, 
              "longitude": "Hello World" 
            },
            "placemark": {
              "name": 69,
              "city": true
            }
          }
        `
      )
      const results = await asyncStorageLoadSpecificRecentLocations([
        { latitude: 41.1234, longitude: -121.1234 }
      ])
      expect(results).toHaveLength(0)
    })
  })
})
