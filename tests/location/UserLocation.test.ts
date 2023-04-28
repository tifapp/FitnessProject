import { LocationAccuracy, LocationOptions } from "expo-location"
import {
  expoQueryUserCoordinates,
  expoTrackUserLocation,
  LocationCoordinatesMocks,
  mockLocationCoordinate2D,
  UserLocationTrackingAccurracy
} from "@lib/location"
import { waitFor } from "@testing-library/react-native"

const testAccuracy = "precise"

describe("UserLocation tests", () => {
  describe("ExpoQueryUserCoordinates tests", () => {
    it("translates a response from expo properly", async () => {
      const coordinates = mockLocationCoordinate2D()
      const getCurrentPosition = jest
        .fn()
        .mockImplementation((options: LocationOptions) => {
          if (options.accuracy === LocationAccuracy.Highest) {
            return Promise.resolve({
              coords: coordinates,
              timestamp: 1000
            })
          }
          return Promise.reject(new Error())
        })

      const response = await expoQueryUserCoordinates(
        "precise",
        getCurrentPosition
      )
      expect(response).toMatchObject({
        coordinates,
        trackingDate: new Date(1000)
      })
    })
  })

  describe("ExpoUserLocationTracking tests", () => {
    test("translates accurracy to proper expo accurracy when making tracking request", () => {
      expectMakesExpoRequestWithAccurracy(
        "approximate-low",
        LocationAccuracy.Low
      )
      expectMakesExpoRequestWithAccurracy(
        "approximate-medium",
        LocationAccuracy.Balanced
      )
      expectMakesExpoRequestWithAccurracy("precise", LocationAccuracy.Highest)
    })

    const expectMakesExpoRequestWithAccurracy = (
      accuracy: UserLocationTrackingAccurracy,
      expoAccuracy: LocationAccuracy
    ) => {
      const track = jest.fn().mockResolvedValue(jest.fn())
      expoTrackUserLocation(accuracy, jest.fn(), track)
      expect(track).toHaveBeenCalledWith(
        expect.objectContaining({ accuracy: expoAccuracy }),
        expect.any(Function)
      )
    }

    test("translates expo location update into TrackedLocation", () => {
      const callback = jest.fn()
      const track = jest.fn().mockImplementation((_, trackFn) => {
        trackFn({
          coords: LocationCoordinatesMocks.Paris,
          timestamp: 1000
        })
        return Promise.resolve()
      })

      expoTrackUserLocation(testAccuracy, callback, track)
      expect(callback).toHaveBeenCalledWith({
        status: "success",
        location: {
          coordinates: LocationCoordinatesMocks.Paris,
          trackingDate: new Date(1000)
        }
      })
    })

    it("sends an error update when expo tracker fails", async () => {
      const callback = jest.fn()
      const track = jest.fn().mockRejectedValue(new Error())

      expoTrackUserLocation(testAccuracy, callback, track)
      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith({ status: "error" })
      })
    })

    it("unsubscribes from expo tracking when unsub invoked", async () => {
      const unsubFromExpo = jest.fn()
      const track = jest.fn().mockResolvedValue({ remove: unsubFromExpo })

      const unsub = expoTrackUserLocation(testAccuracy, jest.fn(), track)
      unsub()
      await waitFor(() => {
        expect(unsubFromExpo).toHaveBeenCalled()
      })
    })
  })
})
