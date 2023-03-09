import { ArrayUtils } from "@lib/Array"

describe("ArrayUtils tests", () => {
  test("filterOptionals", () => {
    const arr = [1, null, undefined, 2]
    expect(ArrayUtils.filterOptionals(arr)).toEqual([1, 2])
  })

  test("lastElementNonEmpty", () => {
    expect(ArrayUtils.lastElementNonEmpty([1, 2, 3])).toEqual(3)
  })
})
