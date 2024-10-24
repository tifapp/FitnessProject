import { USPhoneNumber } from "./USPhoneNumber"

describe("USPhoneNumber tests", () => {
  it("fails to parse an input with letters", () => {
    expect(USPhoneNumber.parse("123456789a")).toBeUndefined()
  })

  it("fails to parse an input with less than 10 digits", () => {
    expect(USPhoneNumber.parse("1234567")).toBeUndefined()
  })

  it("fails to parse an input with more than 10 digits", () => {
    expect(USPhoneNumber.parse("123456789012345")).toBeUndefined()
  })

  it("should parse phone numbers with exactly 10 digits", () => {
    expect(USPhoneNumber.parse("1234567890")?.toString()).toEqual(
      "+11234567890"
    )
  })

  it("should allow phone numbers in the format (***) ***-****", () => {
    expect(USPhoneNumber.parse("(123) 456-7890")?.toString()).toEqual(
      "+11234567890"
    )
  })

  it("should parse e.164 formatted phone numbers", () => {
    expect(USPhoneNumber.parse("+11234567890")?.toString()).toEqual(
      "+11234567890"
    )
  })

  test("privacy formatted", () => {
    const phoneNumber = USPhoneNumber.parse("9258881234")!
    expect(phoneNumber.formattedForPrivacy).toEqual("(***) ***-1234")
  })

  test("pretty formatted", () => {
    const phoneNumber = USPhoneNumber.parse("9258881234")!
    expect(phoneNumber.prettyFormatted).toEqual("+1 (925) 888-1234")
  })
})
