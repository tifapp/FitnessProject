import { MathUtils } from "@lib/utils/Math"

describe("Math tests", () => {
  test("degreesToRadians", () => {
    expect(MathUtils.degreesToRadians(42)).toBeCloseTo(0.733038)
  })

  test("sin2", () => {
    expect(MathUtils.sin2(1)).toBeCloseTo(0.708)
  })

  test("roundToHalf", () => {
    expect(MathUtils.roundToHalf(1)).toEqual(1)
    expect(MathUtils.roundToHalf(1.23)).toEqual(1)
    expect(MathUtils.roundToHalf(1)).toEqual(1)
    expect(MathUtils.roundToHalf(1.25)).toEqual(1.5)
    expect(MathUtils.roundToHalf(1.33)).toEqual(1.5)
    expect(MathUtils.roundToHalf(1.5)).toEqual(1.5)
    expect(MathUtils.roundToHalf(1.55)).toEqual(1.5)
    expect(MathUtils.roundToHalf(1.74)).toEqual(1.5)
    expect(MathUtils.roundToHalf(1.75)).toEqual(2)
    expect(MathUtils.roundToHalf(1.82)).toEqual(2)
    expect(MathUtils.roundToHalf(1.99)).toEqual(2)
    expect(MathUtils.roundToHalf(2)).toEqual(2)
  })
})
