import { SQLiteRecentLocationsStorage } from "@location/Recents"
import {
  awsLocationSearch,
  searchRecentLocations,
  searchWithRecentAnnotations
} from "./SearchClient"
import { LocationsSearchQuery } from "./Models"
import { mockTiFLocation } from "@location/MockData"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { sleep } from "@lib/utils/DelayData"
import { repeatElements } from "TiFShared/lib/Array"

describe("Search client tests", () => {
  resetTestSQLiteBeforeEach()
  const storage = new SQLiteRecentLocationsStorage(testSQLite)

  describe("AWSLocationSearch tests", () => {
    const awsSearch = jest.fn()
    beforeEach(() => awsSearch.mockReset())

    it("should convert request to a proper AWS request with a center coordinate", async () => {
      awsSearch.mockResolvedValueOnce([])
      const coordinate = { latitude: -121.287929, longitude: 40.20982 }
      await awsLocationSearch(
        new LocationsSearchQuery("hello"),
        coordinate,
        awsSearch
      )
      expect(awsSearch).toHaveBeenCalledWith(
        "hello",
        expect.objectContaining({
          biasPosition: [40.20982, -121.287929]
        })
      )
    })

    it("should convert request to a proper AWS request with no center coordinate", async () => {
      awsSearch.mockResolvedValueOnce([])
      await awsLocationSearch(
        new LocationsSearchQuery("hello"),
        undefined,
        awsSearch
      )
      expect(awsSearch).toHaveBeenCalledWith(
        "hello",
        expect.objectContaining({ biasPosition: undefined })
      )
    })

    it("filters results with no geometry", async () => {
      awsSearch.mockResolvedValueOnce([
        {
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
      ])
      const results = await awsLocationSearch(
        new LocationsSearchQuery("Amazon go stores in Seattle"),
        undefined,
        awsSearch
      )
      expect(results).toEqual([])
    })

    it("transforms results into proper TiFLocations", async () => {
      awsSearch.mockResolvedValueOnce([
        {
          geometry: {
            point: [-122.34014899999994, 47.61609000000004]
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
        },
        {
          geometry: {
            point: [-122.3401489382022, 47.616082637]
          },
          addressNumber: "6666",
          country: "USA",
          label: "Seattle, WA, 98154, USA",
          municipality: "Seattle",
          neighborhood: undefined,
          postalCode: "98154",
          region: "Washington",
          street: undefined,
          subRegion: undefined
        }
      ])
      const results = await awsLocationSearch(
        new LocationsSearchQuery("Amazon go stores in Seattle"),
        undefined,
        awsSearch
      )
      expect(results).toEqual([
        {
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
        },
        {
          coordinate: {
            latitude: 47.616082637,
            longitude: -122.3401489382022
          },
          placemark: {
            name: "Seattle",
            country: "USA",
            postalCode: "98154",
            region: "Washington",
            isoCountryCode: "US",
            city: "Seattle",
            streetNumber: "6666"
          }
        }
      ])
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
      const locations = repeatElements(4, () => mockTiFLocation())

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
