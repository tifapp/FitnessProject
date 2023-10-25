import { EventHandle } from "./EventHandle"

describe("EventHandle tests", () => {
  it("should parse a handle with letters, numbers, and underscores", () => {
    expect(EventHandle.parse("jumping_in_the_air_642")!.toString()).toEqual(
      "!jumping_in_the_air_642"
    )
    expect(EventHandle.parse("e")!.toString()).toEqual("!e")
    expect(EventHandle.parse("Hello_World")!.toString()).toEqual("!Hello_World")
  })

  it("should not parse invalid handles", () => {
    expect(EventHandle.parse("123")).toBeUndefined()
    expect(EventHandle.parse("123_hello")).toBeUndefined()
    expect(EventHandle.parse("123hello")).toBeUndefined()
    expect(EventHandle.parse("")).toBeUndefined()
    expect(EventHandle.parse("__________")).toBeUndefined()
    expect(EventHandle.parse("_hello")).toBeUndefined()
    expect(EventHandle.parse("!hello")).toBeUndefined()
    expect(EventHandle.parse("{}{}}{}{}{}{")).toBeUndefined()
    expect(EventHandle.parse("*(&^*(&*(&*(&")).toBeUndefined()
  })
})
