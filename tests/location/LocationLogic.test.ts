import { milesBetweenLocations, Location, formatLocation } from "@lib/location"

describe("Location logic tests", () => {
  test("milesBetweenLocations returns 0 when same location", () => {
    const location: Location = {
      latitude: 45,
      longitude: 45
    }
    expect(milesBetweenLocations(location, location)).toEqual(0)
  })

  test("milesBetweenLocations returns the distance between 2 different locations in miles", () => {
    const location1: Location = {
      latitude: 45.0,
      longitude: 45.0
    }

    const location2: Location = {
      latitude: 53.0,
      longitude: -12.0
    }

    expect(milesBetweenLocations(location1, location2)).toBeCloseTo(2570.531)
  })

  test("formatLocation basic", () => {
    const location = {
      latitude: 43.234,
      longitude: -121.234
    }
    expect(formatLocation(location)).toEqual("43.234, -121.234")
  })

  test("formatLocation rounds off at 6 decimal places", () => {
    const location = {
      latitude: 43.23456789,
      longitude: -121.23456789
    }
    expect(formatLocation(location)).toEqual("43.234568, -121.234568")
  })
})
