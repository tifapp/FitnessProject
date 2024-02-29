import { MathUtils } from "@lib/utils/Math"

describe("Math tests", () => {
  test("degreesToRadians", () => {
    expect(MathUtils.degreesToRadians(42)).toBeCloseTo(0.733038)
  })

  test("sin2", () => {
    expect(MathUtils.sin2(1)).toBeCloseTo(0.708)
  })

  test("roundToHalf", () => {
    expect(MathUtils.roundToDenominator(1, 2)).toEqual(1)
    expect(MathUtils.roundToDenominator(1.23, 2)).toEqual(1)
    expect(MathUtils.roundToDenominator(1.25, 2)).toEqual(1.5)
    expect(MathUtils.roundToDenominator(1.33, 2)).toEqual(1.5)
    expect(MathUtils.roundToDenominator(1.5, 2)).toEqual(1.5)
    expect(MathUtils.roundToDenominator(1.55, 2)).toEqual(1.5)
    expect(MathUtils.roundToDenominator(1.74, 2)).toEqual(1.5)
    expect(MathUtils.roundToDenominator(1.75, 2)).toEqual(2)
    expect(MathUtils.roundToDenominator(1.82, 2)).toEqual(2)
    expect(MathUtils.roundToDenominator(1.99, 2)).toEqual(2)
    expect(MathUtils.roundToDenominator(2, 2)).toEqual(2)
    expect(MathUtils.roundToDenominator(3.2, 3)).toBeCloseTo(3.333333333333)
    expect(MathUtils.roundToDenominator(3.01, 3)).toEqual(3)
    expect(MathUtils.roundToDenominator(3.75, 3)).toBeCloseTo(3.666666666666)
    expect(MathUtils.roundToDenominator(3.95, 3)).toEqual(4)
  })
})
