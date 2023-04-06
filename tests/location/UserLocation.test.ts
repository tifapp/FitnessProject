import { LocationAccuracy } from "expo-location"
import { expoTrackUserLocation, UserLocationTrackingAccurracy } from "@lib/location"

const testAccuracy = "precise"

describe("UserLocation tests", () => {
  describe("ExpoUserLocationTracking tests", () => {
    test("translates accurracy to proper expo accurracy when making tracking request", () => {
      expectAccuracyConversion("approximate-low", LocationAccuracy.Low)
      expectAccuracyConversion("approximate-medium", LocationAccuracy.Balanced)
      expectAccuracyConversion("precise", LocationAccuracy.Highest)
    })

    it("should unsubscribe from expo tracking when return callback invoked", async () => {
      const unsubFromExpo = jest.fn()
      const track = jest.fn().mockResolvedValue({ remove: unsubFromExpo })

      const unsub = expoTrackUserLocation(testAccuracy, jest.fn(), track)
      await unsub()
      expect(unsubFromExpo).toHaveBeenCalled()
    })

    test("translates expo location update into TrackedLocation", () => {
      const callback = jest.fn()
      const track = jest.fn().mockImplementation((_, trackFn) => {
        trackFn({ coords: { latitude: 32.1234, longitude: -121.1234 }, timestamp: 1000 })
        return Promise.resolve()
      })
      expoTrackUserLocation(testAccuracy, callback, track)
      expect(callback).toHaveBeenCalledWith({
        status: "success",
        location: {
          coordinate: { latitude: 32.1234, longitude: -121.1234 },
          trackingDate: new Date(1)
        }
      })
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
