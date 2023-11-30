import { Coordinates } from "@aws-amplify/geo"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { asyncStorageSaveRecentLocation } from "./RecentsStorage"
import {
  awsPlaceToTifLocation,
  searchRecentLocations,
  searchWithRecentAnnotations
} from "./SearchClient"
import { mockLocationSearchFunction } from "./MockData"
import { LocationsSearchQuery } from "./Models"
import { mockTiFLocation, mockLocationCoordinate2D } from "@location/MockData"

describe("Search client tests", () => {
  beforeEach(async () => await AsyncStorage.clear())
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
        coordinates: {
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
    it("gives a LocationSearchResult array when called with information in async storage", async () => {
      const location1 = mockTiFLocation()
      const location2 = mockTiFLocation()
      const location3 = mockTiFLocation()
      await asyncStorageSaveRecentLocation(location1, "attended-event")
      await asyncStorageSaveRecentLocation(location2, "hosted-event")
      await asyncStorageSaveRecentLocation(location3, "hosted-event")

      const results = await searchRecentLocations()

      expect(results).toEqual([
        {
          location: location3,
          annotation: "hosted-event",
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
      const results = await searchRecentLocations()
      expect(results).toEqual([])
    })
  })

  describe("searchWithRecentAnnotations tests", () => {
    it("returns an array of valid LocationSearchResults when given a proper callback", async () => {
      const mockLocation1 = mockLocationCoordinate2D()
      const mockLocation2 = mockLocationCoordinate2D()
      const mockLocation3 = mockLocationCoordinate2D()
      const mockLocation4 = mockLocationCoordinate2D()
      const mockTiFLocation1 = {
        coordinates: mockLocation1,
        placemark: { name: "New York" }
      }
      const mockTiFLocation2 = {
        coordinates: mockLocation2,
        placemark: { name: "Joe" }
      }
      const mockTiFLocation3 = {
        coordinates: mockLocation3,
        placemark: { name: "New York" }
      }
      const mockTiFLocation4 = {
        coordinates: mockLocation4,
        placemark: { name: "New York" }
      }

      const testQuery = new LocationsSearchQuery("New York")

      await asyncStorageSaveRecentLocation(mockTiFLocation1, "attended-event")
      await asyncStorageSaveRecentLocation(mockTiFLocation2, "hosted-event")
      await asyncStorageSaveRecentLocation(mockTiFLocation3, "hosted-event")
      await asyncStorageSaveRecentLocation(mockTiFLocation4, undefined)

      const testResults = await searchWithRecentAnnotations(
        testQuery,
        undefined,
        mockLocationSearchFunction
      )
      expect(testResults).toEqual([
        {
          location: mockTiFLocation4,
          annotation: undefined,
          isRecentLocation: false
        },
        {
          location: mockTiFLocation3,
          annotation: "hosted-event",
          isRecentLocation: true
        },
        {
          location: mockTiFLocation1,
          annotation: "attended-event",
          isRecentLocation: true
        }
      ])
    })
  })
})
