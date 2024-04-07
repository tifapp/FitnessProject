import {
  compactFormatDistance,
  compactFormatFeet,
  compactFormatMiles
} from "./DistanceFormatting"

describe("DistanceFormatting tests", () => {
  describe("compactFormatMiles tests", () => {
    it("only uses 1 decimal place", () => {
      expect(compactFormatMiles(1.1234)).toEqual("1.1 mi")
    })

    it("rounds to nearest tenth", () => {
      expect(compactFormatMiles(1.1534)).toEqual("1.2 mi")
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

    it("omits commas from large numbers", () => {
      expect(compactFormatMiles(5909.3)).toEqual("5909.3 mi")
    })

    it("never goes below 0.1 mi", () => {
      expect(compactFormatMiles(0.00001)).toEqual("0.1 mi")
    })
  })

  describe("compactFormatFeet tests", () => {
    it("rounds to the nearest whole number", () => {
      expect(compactFormatFeet(52.8)).toEqual("53 ft")
    })

    it("omits commas from large numbers", () => {
      expect(compactFormatFeet(78292)).toEqual("78292 ft")
    })

    it("never goes below 1 ft", () => {
      expect(compactFormatFeet(0.00001)).toEqual("1 ft")
    })
  })

  describe("CompactFormatDistance tests", () => {
    it("should display in miles", () => {
      expect(compactFormatDistance(12.3)).toEqual("12.3 mi")
    })

    it("should display in feet when the distance is small", () => {
      expect(compactFormatDistance(0.03)).toEqual("158 ft")
    })
  })
})
