import { minRegionRadius, mockLocationCoordinate2D } from "@lib/location"

describe("Region tests", () => {
  describe("minRegionRadius tests", () => {
    it("uses half the minimum of the lat and lng delta as the min radius", () => {
      const region = {
        ...mockLocationCoordinate2D(),
        latitudeDelta: 0.2,
        longitudeDelta: 0.3
      }
      expect(minRegionRadius(region)).toEqual(0.1)

      region.latitudeDelta = 0.5
      region.longitudeDelta = 0.3
      expect(minRegionRadius(region)).toEqual(0.15)
    })
  })
})
