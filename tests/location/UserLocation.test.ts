import { LocationAccuracy } from "expo-location"
import { expoTrackUserLocation, UserLocationTrackingAccurracy } from "@lib/location"

describe("UserLocation tests", () => {
  describe("ExpoUserLocationTracking tests", () => {
    test("translates accurracy to proper expo accurracy when making tracking request", async () => {
      expectAccuracyConversion("approximate-low", LocationAccuracy.Low)
      expectAccuracyConversion("approximate-medium", LocationAccuracy.Balanced)
      expectAccuracyConversion("precise", LocationAccuracy.Highest)
    })

    const expectAccuracyConversion = (
      accuracy: UserLocationTrackingAccurracy,
      expoAccuracy: LocationAccuracy
    ) => {
      const track = jest.fn().mockResolvedValue(jest.fn())
      expoTrackUserLocation(accuracy, track)
      expect(track).toHaveBeenCalledWith(
        expect.objectContaining({ accuracy: expoAccuracy })
      )
    }
  })
})
