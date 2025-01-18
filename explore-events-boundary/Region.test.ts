import {
  maxRegionMeterRadius,
  regionRect,
  containsRegionRect,
  containsRegion,
  isSignificantlyDifferentRegions
} from "./Region"

describe("Region tests", () => {
  describe("maxRegionMeterRadius tests", () => {
    it("uses the latitude delta meter length when latitude delta more then longitude delta", () => {
      expect(
        maxRegionMeterRadius({
          latitude: 88.1,
          longitude: 44.1,
          latitudeDelta: 0.4,
          longitudeDelta: 0.3
        })
      ).toBeCloseTo(22238.985)
    })

    it("uses the longitude delta meter length when longitude delta more then latitude delta", () => {
      expect(
        maxRegionMeterRadius({
          latitude: 88.1,
          longitude: 44.1,
          latitudeDelta: 0.7,
          longitudeDelta: 0.8
        })
      ).toBeCloseTo(1474.672)
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

  describe("isSignificantlyDifferentRegion tests", () => {
    it("returns false when same regions", () => {
      const region = {
        latitude: 88.18372789,
        longitude: -44.1312789,
        latitudeDelta: 0.3,
        longitudeDelta: 0.2
      }
      expect(isSignificantlyDifferentRegions(region, region)).toEqual(false)
    })

    it("returns true when regions are not contained within each other", () => {
      expect(
        isSignificantlyDifferentRegions(
          {
            latitude: 0.0,
            longitude: 0.0,
            latitudeDelta: 0.3,
            longitudeDelta: 0.2
          },
          {
            latitude: 88.18372789,
            longitude: -44.1312789,
            latitudeDelta: 0.3,
            longitudeDelta: 0.2
          }
        )
      ).toEqual(true)
    })

    it("returns true when regions are contained within each other and min radius distance greater then threshold", () => {
      expect(
        isSignificantlyDifferentRegions(
          {
            latitude: 88.18372789,
            longitude: -44.1312789,
            latitudeDelta: 0.0000003,
            longitudeDelta: 0.0000002
          },
          {
            latitude: 88.18372789,
            longitude: -44.1312789,
            latitudeDelta: 0.88881837,
            longitudeDelta: 0.7188872
          },
          1000
        )
      ).toEqual(true)
    })

    it("returns false when regions are contained within each other and min radius distance lower then threshold", () => {
      expect(
        isSignificantlyDifferentRegions(
          {
            latitude: 88.18372789,
            longitude: -44.1312789,
            latitudeDelta: 0.29999,
            longitudeDelta: 0.19999
          },
          {
            latitude: 88.18372789,
            longitude: -44.1312789,
            latitudeDelta: 0.39877297,
            longitudeDelta: 0.2901902
          },
          10_000
        )
      ).toEqual(false)
    })
  })
})
