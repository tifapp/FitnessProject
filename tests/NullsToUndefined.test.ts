import { nullsToUndefined } from "@lib/NullsToUndefined"

describe("NullsToUndefined tests", () => {
  test("null converts to undefined", () => {
    expect(nullsToUndefined(null)).toBeUndefined()
  })

  test("shallowly converts null values in object to undefined", () => {
    expect(nullsToUndefined({ a: 1, b: null })).toMatchObject({
      a: 1,
      b: undefined
    })
  })

  test("deeply converts null values in object to undefined", () => {
    expect(
      nullsToUndefined({ a: 1, b: { c: null, d: { e: null, f: "Hello" } } })
    ).toMatchObject({
      a: 1,
      b: { c: undefined, d: { e: undefined, f: "Hello" } }
    })
  })

  test("shallowly converts array nulls to undefined", () => {
    expect(nullsToUndefined([1, null])).toEqual([1, undefined])
  })

  test("deeply converts array nulls to undefined", () => {
    expect(nullsToUndefined([1, [2, null]])).toEqual([1, [2, undefined]])
  })

  test("converts object nulls to undefined in array", () => {
    expect(nullsToUndefined([1, { a: null, b: 2 }])).toEqual([
      1,
      { a: undefined, b: 2 }
    ])
  })

  test("converts array nulls to undefined in object", () => {
    expect(nullsToUndefined({ a: 1, b: [2, null] })).toMatchObject({
      a: 1,
      b: [2, undefined]
    })
  })

  it("does not modify input object", () => {
    const obj = { a: null, b: 1 }
    nullsToUndefined(obj)
    expect(obj).toMatchObject({ a: null, b: 1 })
  })

  it("does not modify input array", () => {
    const obj = [null, 2]
    nullsToUndefined(obj)
    expect(obj).toMatchObject([null, 2])
  })
})
