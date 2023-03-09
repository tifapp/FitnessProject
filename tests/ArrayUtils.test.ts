import { ArrayUtils } from "@lib/Array"

describe("ArrayUtils tests", () => {
  test("takeNonNulls", () => {
    const arr = [1, null, undefined, 2]
    expect(ArrayUtils.takeNonNulls(arr)).toEqual([1, 2])
  })
})
