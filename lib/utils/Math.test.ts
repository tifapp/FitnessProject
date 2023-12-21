import { MathUtils } from "@lib/utils/Math"

describe("Math tests", () => {
  test("degreesToRadians", () => {
    expect(MathUtils.degreesToRadians(42)).toBeCloseTo(0.733038)
  })

  test("sin2", () => {
    expect(MathUtils.sin2(1)).toBeCloseTo(0.708)
  })
})
