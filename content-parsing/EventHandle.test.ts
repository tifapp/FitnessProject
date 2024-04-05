import { ColorString } from "TiFShared/domain-models/ColorString"
import { EventHandle } from "./EventHandle"

describe("EventHandle tests", () => {
  it("should be able to parse a valid handle string", () => {
    const handle = EventHandle.parse("17|123/#123456/Pickup Basketball")
    expect(handle?.eventId).toEqual(123)
    expect(handle?.eventName).toEqual("Pickup Basketball")
    expect(handle?.color).toEqual(ColorString.parse("#123456"))
  })

  it("should truncate the event name based on the length encoded in the handle", () => {
    const handle = EventHandle.parse("12|123/#123456/Pickup Basketball")
    expect(handle?.eventName).toEqual("Pickup Baske")
  })

  it("should be able to parse a valid handle string where the length is longer than the name", () => {
    const handle = EventHandle.parse("420|123/#123456/Pickup Basketball")
    expect(handle?.eventName).toEqual("Pickup Basketball")
  })

  it("should be able to parse a valid handle from a starting point in the given string", () => {
    const handle = EventHandle.parse("!!!!17|123/#123456/Pickup Basketball", 4)
    expect(handle?.eventId).toEqual(123)
    expect(handle?.eventName).toEqual("Pickup Basketball")
  })

  test("invalid handles", () => {
    expect(EventHandle.parse("")).toBeUndefined()
    expect(EventHandle.parse("123/Pickup Basketball")).toBeUndefined()
    expect(EventHandle.parse("17|Pickup Basketball")).toBeUndefined()
    expect(EventHandle.parse("hello world")).toBeUndefined()
    expect(EventHandle.parse("abc|123/Pickup Basketball")).toBeUndefined()
    expect(EventHandle.parse("17|abc/Pickup Basketball")).toBeUndefined()
    expect(EventHandle.parse("!17|123/Pickup Basketball")).toBeUndefined()
    expect(
      EventHandle.parse("17|123/#ZZZZZZ/Pickup Basketball")
    ).toBeUndefined()
  })

  test("toString", () => {
    expect(
      new EventHandle(
        123,
        "Pickup Basketball",
        ColorString.parse("#123456")!
      ).toString()
    ).toEqual("!17|123/#123456/Pickup Basketball")
  })
})
