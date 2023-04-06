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

      const unsub = expoTrackUserLocation(testAccuracy, track)
      await unsub()
      expect(unsubFromExpo).toHaveBeenCalled()
    })

    const expectAccuracyConversion = (
      accuracy: UserLocationTrackingAccurracy,
      expoAccuracy: LocationAccuracy
    ) => {
      const track = jest.fn().mockResolvedValue(jest.fn())
      expoTrackUserLocation(accuracy, track)
      expect(track).toHaveBeenCalledWith(
        expect.objectContaining({ accuracy: expoAccuracy }),
        expect.anything()
      )
    }
  })
})
