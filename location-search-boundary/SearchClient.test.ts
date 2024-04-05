import { Coordinates } from "@aws-amplify/geo"
import { SQLiteRecentLocationsStorage } from "@lib/RecentsLocations"
import {
  awsPlaceToTifLocation,
  searchRecentLocations,
  searchWithRecentAnnotations
} from "./SearchClient"
import { LocationsSearchQuery } from "./Models"
import { mockTiFLocation } from "@location/MockData"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { ArrayUtils } from "@lib/utils/Array"
import { sleep } from "@lib/utils/DelayData"

describe("Search client tests", () => {
  resetTestSQLiteBeforeEach()
  const storage = new SQLiteRecentLocationsStorage(testSQLite)

  describe("awsPlaceToTiFLocation tests", () => {
    it("returns undefined if there is no geometry", () => {
      const testPlace = {
        geometry: undefined,
        addressNumber: "2131",
        country: "USA",
        label: "Amazon Go, 2131 7th Ave, Seattle, WA, 98121, USA",
        municipality: "Seattle",
        neighborhood: undefined,
        postalCode: "98121",
        region: "Washington",
        street: "7th Ave",
        subRegion: "King County"
      }
      expect(awsPlaceToTifLocation(testPlace)).toBeUndefined()
    })
    it("returns a TiFLocation when given valid input", () => {
      const testPlace = {
        geometry: {
          point: [-122.34014899999994, 47.61609000000004] as Coordinates
        },
        addressNumber: "2131",
        country: "USA",
        label: "Amazon Go, 2131 7th Ave, Seattle, WA, 98121, USA",
        municipality: "Seattle",
        neighborhood: undefined,
        postalCode: "98121",
        region: "Washington",
        street: "7th Ave",
        subRegion: "King County"
      }
      expect(awsPlaceToTifLocation(testPlace)).toMatchObject({
        coordinate: {
          latitude: 47.61609000000004,
          longitude: -122.34014899999994
        },
        placemark: {
          name: "Amazon Go",
          country: "USA",
          postalCode: "98121",
          street: "7th Ave",
          streetNumber: "2131",
          region: "Washington",
          isoCountryCode: "US",
          city: "Seattle"
        }
      })
    })
  })
  describe("searchRecentLocations tests", () => {
    it("gives a LocationSearchResult array when called with information in sqlite", async () => {
      const location1 = mockTiFLocation()
      const location2 = mockTiFLocation()
      const location3 = mockTiFLocation()
      await storage.save(location1, "attended-event")
      await sleep(10)
      await storage.save(location2, "hosted-event")
      await sleep(10)
      await storage.save(location3)

      const results = await searchRecentLocations(storage)

      expect(results).toEqual([
        {
          location: location3,
          annotation: undefined,
          isRecentLocation: true
        },
        {
          location: location2,
          annotation: "hosted-event",
          isRecentLocation: true
        },
        {
          location: location1,
          annotation: "attended-event",
          isRecentLocation: true
        }
      ])
    })
    it("returns an empty array when called with faulty or nonexistent information", async () => {
      const results = await searchRecentLocations(storage)
      expect(results).toEqual([])
    })
  })

  describe("searchWithRecentAnnotations tests", () => {
    it("returns an array of valid LocationSearchResults when given a proper callback", async () => {
      const locations = ArrayUtils.repeatElements(4, () => mockTiFLocation())

      await storage.save(locations[0], "attended-event")
      await storage.save(locations[2])

      const testResults = await searchWithRecentAnnotations(
        new LocationsSearchQuery("New York"),
        undefined,
        storage,
        jest.fn().mockResolvedValueOnce(locations)
      )
      expect(testResults).toEqual([
        {
          location: locations[0],
          annotation: "attended-event",
          isRecentLocation: true
        },
        {
          location: locations[1],
          annotation: undefined,
          isRecentLocation: false
        },
        {
          location: locations[2],
          annotation: undefined,
          isRecentLocation: true
        },
        {
          location: locations[3],
          annotation: undefined,
          isRecentLocation: false
        }
      ])
    })
  })
})
