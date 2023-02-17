import { degreesToRadians, sin2 } from "@lib/Math"

describe("Math tests", () => {
  test("degreesToRadians", () => {
    expect(degreesToRadians(42)).toBeCloseTo(0.733038)
  })

  test("sin2", () => {
    expect(sin2(1)).toBeCloseTo(0.708)
  })
})
