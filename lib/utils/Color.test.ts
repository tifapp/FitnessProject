import { ColorString } from "./Color"

describe("ColorString tests", () => {
  it("should parse rrggbb color strings", () => {
    expectParses("#123456")
    expectParses("#aabbcc")
    expectParses("#AAbbCC")
    expectParses("#FF12EE")
    expectParses("#Ab66Ff")
    expectParses("#999999")
    expectParses("#000000")
    expectParses("#DDddDD")
  })

  it("should parse rrggbbaa color strings", () => {
    expectParses("#12345612")
    expectParses("#aabbccAA")
    expectParses("#FFFFFFaa")
  })

  test("invalid color strings", () => {
    expectNotParses("12345677")
    expectNotParses("#ZZZZZZ")
    expectNotParses("#123")
    expectNotParses("Hello world")
    expectNotParses("white")
    expectNotParses("")
  })

  const expectParses = (rawString: string) => {
    const hexString = ColorString.parse(rawString)?.toString().toLowerCase()
    expect(hexString).toEqual(rawString.toLowerCase())
  }

  const expectNotParses = (rawString: string) => {
    expect(ColorString.parse(rawString)).toBeUndefined()
  }

  test("opacity", () => {
    expect(
      ColorString.parse("#ffffff")?.withOpacity(0.66666666666).toString()
    ).toEqual("#ffffffaa")

    expect(ColorString.parse("#ffffff")?.withOpacity(0.49).toString()).toEqual(
      "#ffffff7d"
    )
  })
})
