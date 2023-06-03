import {
  containsRegion,
  minRegionRadius,
  mockLocationCoordinate2D,
  regionRect
} from "@lib/location"

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

  describe("regionRect tests", () => {
    test("basics", () => {
      const region = {
        latitude: 90,
        longitude: -90,
        latitudeDelta: 0.3,
        longitudeDelta: 0.2
      }
      expect(regionRect(region)).toMatchObject({
        topLeft: { latitude: 90.15, longitude: -90.1 },
        topRight: { latitude: 90.15, longitude: -89.9 },
        bottomLeft: { latitude: 89.85, longitude: -90.1 },
        bottomRight: { latitude: 89.85, longitude: -89.9 }
      })
    })
  })

  describe("containsRegion tests", () => {
    it("should return false when non-intersecting regions", () => {
      const r1 = {
        latitude: 0.0,
        longitude: 0.0,
        latitudeDelta: 0.3,
        longitudeDelta: 0.2
      }

      const r2 = {
        latitude: 90,
        longitude: -90,
        latitudeDelta: 0.3,
        longitudeDelta: 0.2
      }

      expect(containsRegion(r1, r2)).toEqual(false)
    })
  })
})
