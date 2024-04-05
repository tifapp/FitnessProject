import { mockLocationCoordinate2D, mockTiFLocation } from "@location/MockData"
import { SQLiteRecentLocationsStorage } from "./RecentsLocations"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { ArrayUtils } from "@lib/utils/Array"
import { sleep } from "@lib/utils/DelayData"
import { repeatElements } from "TiFShared/lib/Array"

describe("RecentLocationStorage tests", () => {
  describe("SQLiteRecentLocations tests", () => {
    resetTestSQLiteBeforeEach()
    const storage = new SQLiteRecentLocationsStorage(testSQLite)

    it("should return no recent locations when no locations are saved", async () => {
      const recents = await storage.recent(10)
      expect(recents).toEqual([])
    })

    it("should return no locations for coordinates when no locations are saved", async () => {
      const coordinates = repeatElements(3, () => {
        return mockLocationCoordinate2D()
      })
      const locations = await storage.locationsForCoordinates(coordinates)
      expect(locations).toEqual([])
    })

    test("save then load single location from recents", async () => {
      const location = mockTiFLocation()
      await storage.save(location, "attended-event")
      const recents = await storage.recent(10)
      expect(recents).toEqual([{ location, annotation: "attended-event" }])
    })

    test("save then load single location by its coordinates", async () => {
      const location = mockTiFLocation()
      await storage.save(location, "attended-event")
      const recents = await storage.locationsForCoordinates([
        location.coordinate
      ])
      expect(recents).toEqual([{ location, annotation: "attended-event" }])
    })

    test("loads multiple recent locations ordered by most recently saved", async () => {
      const location1 = { ...mockTiFLocation(), placemark: { name: "hello" } }
      const location2 = mockTiFLocation()
      const location3 = mockTiFLocation()

      await storage.save(location1)
      await sleep(10)
      await storage.save(location2, "hosted-event")
      await sleep(10)
      await storage.save(location3, "attended-event")
      await sleep(10)
      await storage.save(location1)

      const results = await storage.recent(2)
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

    test("loading multiple recent locations by their coordinates", async () => {
      const location1 = mockTiFLocation()
      const location2 = mockTiFLocation()
      const location3 = mockTiFLocation()
      await storage.save(location1, "attended-event")
      await sleep(10)
      await storage.save(location2, "hosted-event")

      const results = await storage.locationsForCoordinates([
        location1.coordinate,
        location2.coordinate,
        location3.coordinate
      ])
      expect(results).toEqual([
        expect.objectContaining({
          location: location2,
          annotation: "hosted-event"
        }),
        expect.objectContaining({
          location: location1,
          annotation: "attended-event"
        })
      ])
    })

    test("load locations by coordinates with first longitude value equal to second latitude value", async () => {
      await storage.save(
        mockTiFLocation({ latitude: -50.123, longitude: -50.123 })
      )
      const results = await storage.locationsForCoordinates([
        { latitude: 45.123, longitude: -50.123 },
        { latitude: -50.123, longitude: 45.123 }
      ])
      expect(results).toEqual([])
    })

    test("load locations by coordinates using duplicate coordinates", async () => {
      const locations = repeatElements(2, () => mockTiFLocation())
      await storage.save(locations[0], "attended-event")
      await storage.save(locations[1])
      const results = await storage.locationsForCoordinates([
        locations[0].coordinate,
        locations[0].coordinate
      ])
      expect(results).toEqual([
        {
          location: locations[0],
          annotation: "attended-event"
        }
      ])
    })
  })
})
