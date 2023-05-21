import { mockTrackedLocationCoordinate } from "@lib/location"
import { exploreFetchUserLocation } from "@screens/Explore"

describe("Explore tests", () => {
  describe("exploreFetchUserLocation tests", () => {
    it("returns a permissions denied status when location permission request is denied", async () => {
      expect(
        await exploreFetchUserLocation(
          jest.fn().mockResolvedValue({ granted: false }),
          jest.fn()
        )
      ).toMatchObject({ status: "permission-denied" })
    })

    it("loads the user's location when location permission request is granted", async () => {
      const trackedCoordinate = mockTrackedLocationCoordinate()
      expect(
        await exploreFetchUserLocation(
          jest.fn().mockResolvedValue({ granted: true }),
          jest.fn().mockResolvedValue(trackedCoordinate)
        )
      ).toMatchObject({ status: "success", location: trackedCoordinate })
    })
  })

  describe("useExplore tests", () => {})
})
