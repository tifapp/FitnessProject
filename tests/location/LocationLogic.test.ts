import { milesBetweenLocations, Location } from "@lib/location"

const testLocationDate = new Date()

describe("Location logic tests", () => {
  test("milesBetweenLocations", () => {
    const location1: Location = {
      latitude: 45.0,
      longitude: 45.0,
      date: testLocationDate
    }

    const location2: Location = {
      latitude: 53.0,
      longitude: -12.0,
      date: testLocationDate
    }

    expect(milesBetweenLocations(location1, location2)).toBeCloseTo(2570.531)
  })
})
