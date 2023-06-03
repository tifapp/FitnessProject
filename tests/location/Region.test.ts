import {
  containsRegion,
  containsRegionRect,
  minRegionRadius,
  mockLocationCoordinate2D,
  regionLongitudeDeltaToMeters,
  regionRect
} from "@lib/location"

describe("Region tests", () => {
  describe("LatLngDeltaToMeters tests", () => {
    test("longitude delta to meters", () => {
      const region = {
        latitude: 92.7863,
        longitude: -90,
        latitudeDelta: 0.3,
        longitudeDelta: 0.2
      }
      expect(regionLongitudeDeltaToMeters(region)).toBeCloseTo(66114.211)
    })
  })

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

  describe("RegionRect tests", () => {
    describe("RegionToRect tests", () => {
      test("basics", () => {
        const region = {
          latitude: 90,
          longitude: -90,
          latitudeDelta: 0.3,
          longitudeDelta: 0.2
        }
        expect(regionRect(region)).toMatchObject({
          northLatitude: 90.15,
          southLatitude: 89.85,
          westLongitude: -90.1,
          eastLongitude: -89.9
        })
      })
    })

    describe("Intersection tests", () => {
      test("same region rect intersects", () => {
        const rect = {
          northLatitude: 90.15,
          southLatitude: 89.85,
          westLongitude: -90.1,
          eastLongitude: -89.9
        }
        expect(containsRegionRect(rect, rect)).toEqual(true)
      })

      test("unrelated rects do not intersect", () => {
        expect(
          containsRegionRect(
            {
              northLatitude: 90.15,
              southLatitude: 89.85,
              westLongitude: -13.9,
              eastLongitude: -11.9
            },
            {
              northLatitude: 11.15,
              southLatitude: 13.85,
              westLongitude: -90.9,
              eastLongitude: -92.9
            }
          )
        ).toEqual(false)
      })

      test("top partial intersection does not contain rect", () => {
        expect(
          containsRegionRect(
            {
              northLatitude: 90.15,
              southLatitude: 89.85,
              westLongitude: -13.1,
              eastLongitude: -12.9
            },
            {
              northLatitude: 91.1,
              southLatitude: 90.1,
              westLongitude: -15.003,
              eastLongitude: -14.003
            }
          )
        ).toEqual(false)
      })

      test("bottom partial intersection does not contain rect", () => {
        expect(
          containsRegionRect(
            {
              northLatitude: 90.15,
              southLatitude: 89.85,
              westLongitude: -13.1,
              eastLongitude: -12.9
            },
            {
              northLatitude: 93.1,
              southLatitude: 92.1,
              westLongitude: -14.003,
              eastLongitude: -13.003
            }
          )
        ).toEqual(false)
      })

      test("top left intersection", () => {
        expect(
          containsRegionRect(
            {
              northLatitude: 90.15,
              southLatitude: 89.85,
              westLongitude: -13.1,
              eastLongitude: -12.9
            },
            {
              northLatitude: 91.1,
              southLatitude: 90.1,
              westLongitude: -14.003,
              eastLongitude: -13.003
            }
          )
        ).toEqual(true)
      })

      test("top right intersection", () => {
        expect(
          containsRegionRect(
            {
              northLatitude: 90.15,
              southLatitude: 89.85,
              westLongitude: -13.1,
              eastLongitude: -12.9
            },
            {
              northLatitude: 91.1,
              southLatitude: 90.1,
              westLongitude: -13.003,
              eastLongitude: -12.003
            }
          )
        ).toEqual(true)
      })

      test("bottom left intersection", () => {
        expect(
          containsRegionRect(
            {
              northLatitude: 90.15,
              southLatitude: 89.85,
              westLongitude: -13.1,
              eastLongitude: -12.9
            },
            {
              northLatitude: 89.9,
              southLatitude: 88.9,
              westLongitude: -14.003,
              eastLongitude: -13.003
            }
          )
        ).toEqual(true)
      })

      test("bottom right intersection", () => {
        expect(
          containsRegionRect(
            {
              northLatitude: 90.15,
              southLatitude: 89.85,
              westLongitude: -13.1,
              eastLongitude: -12.9
            },
            {
              northLatitude: 89.9,
              southLatitude: 88.9,
              westLongitude: -13.003,
              eastLongitude: -12.003
            }
          )
        ).toEqual(true)
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

    it("should return true when region rects contains each other", () => {
      const r1 = {
        latitude: 90,
        longitude: -90,
        latitudeDelta: 0.3,
        longitudeDelta: 0.2
      }
      const r2 = {
        latitude: 89.8,
        longitude: -90.8,
        latitudeDelta: 0.5,
        longitudeDelta: 1.4
      }
      expect(containsRegion(r1, r2)).toEqual(true)
    })
  })
})
