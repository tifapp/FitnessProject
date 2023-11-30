import { milesBetweenLocations, LocationCoordinate2D } from "@location/index"

describe("LocationCoordinate2D tests", () => {
  describe("milesBetweenLocations tests", () => {
    it("returns 0 when same location", () => {
      const location: LocationCoordinate2D = {
        latitude: 45,
        longitude: 45
      }
      expect(milesBetweenLocations(location, location)).toEqual(0)
    })

    it("returns the distance between 2 different locations in miles", () => {
      const location1: LocationCoordinate2D = {
        latitude: 45.0,
        longitude: 45.0
      }

      const location2: LocationCoordinate2D = {
        latitude: 53.0,
        longitude: -12.0
      }

      expect(milesBetweenLocations(location1, location2)).toBeCloseTo(2570.531)
    })
  })
})
