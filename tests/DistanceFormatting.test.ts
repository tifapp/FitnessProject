import { compactFormatMiles } from "@lib/DistanceFormatting"

describe("compactFormatMiles tests", () => {
  it("only uses 1 decimal place", () => {
    expect(compactFormatMiles(1.1234)).toEqual("1.1 mi")
  })

  it("rounds to nearest tenth", () => {
    expect(compactFormatMiles(1.1534)).toEqual("1.2 mi")
  })

  it("always rounds upto 0.1 when less than 0.1", () => {
    expect(compactFormatMiles(0.000001)).toEqual("0.1 mi")
  })

  it("formats whole numbers", () => {
    expect(compactFormatMiles(1)).toEqual("1 mi")
  })

  it("rounds down to whole number when applicable", () => {
    expect(compactFormatMiles(1.001)).toEqual("1 mi")
  })

  it("handles double digit numbers", () => {
    expect(compactFormatMiles(10.1)).toEqual("10.1 mi")
  })
})
