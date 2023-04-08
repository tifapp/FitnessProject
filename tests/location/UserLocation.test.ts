import { LocationAccuracy } from "expo-location"
import {
  expoTrackUserLocation,
  UserLocationTrackingAccurracy
} from "@lib/location"

const testAccuracy = "precise"

describe("UserLocation tests", () => {
  describe("ExpoUserLocationTracking tests", () => {
    test("translates accurracy to proper expo accurracy when making tracking request", () => {
      expectAccuracyConversion("approximate-low", LocationAccuracy.Low)
      expectAccuracyConversion("approximate-medium", LocationAccuracy.Balanced)
      expectAccuracyConversion("precise", LocationAccuracy.Highest)
    })

    test("translates expo location update into TrackedLocation", () => {
      const callback = jest.fn()
      const track = jest.fn().mockImplementation((_, trackFn) => {
        trackFn({
          coords: { latitude: 32.1234, longitude: -121.1234 },
          timestamp: 1000
        })
        return Promise.resolve()
      })

      expoTrackUserLocation(testAccuracy, callback, track)
      expect(callback).toHaveBeenCalledWith({
        status: "success",
        location: {
          coordinates: { latitude: 32.1234, longitude: -121.1234 },
          trackingDate: new Date(1)
        }
      })
    })

    it("sends an error update when expo tracker fails", async () => {
      const callback = jest.fn()
      const track = jest.fn()

      // NB: Expo makes their API asynchronous, however since we're in
      // a syncronous context we use a promise to ensure that our callback
      // actually consumes the error event before the test ends.
      const errorPromise = new Promise<void>((resolve) => {
        track.mockImplementation(() => {
          resolve()
          return Promise.reject(new Error())
        })
      })

      expoTrackUserLocation(testAccuracy, callback, track)
      await errorPromise
      expect(callback).toHaveBeenCalledWith({ status: "error" })
    })

    it("unsubscribes from expo tracking when unsub invoked", async () => {
      const track = jest.fn()
      const unsubFromExpo = jest.fn()

      // NB: The unsub function is in a "fire-and-forget" style, which means
      // we can't tell when it will actually unsubscribe from expo (since
      // expo's tracker returns a promise). This promise ensures that we give
      // a chance for the tracker to resolve before asserting.
      const trackPromise = new Promise<void>((resolve) => {
        track.mockImplementation(() => {
          resolve()
          return Promise.resolve({ remove: unsubFromExpo })
        })
      })

      const unsub = expoTrackUserLocation(testAccuracy, jest.fn(), track)
      unsub()
      await trackPromise
      expect(unsubFromExpo).toHaveBeenCalled()
    })

    const expectAccuracyConversion = (
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
  })
})
