import {
  USPhoneNumber,
  prettyFormatIncrementalE164PhoneNumber
} from "./PhoneNumber"

describe("PhoneNumber tests", () => {
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
      expect(USPhoneNumber.parse("1234567890")?.e164Formatted).toEqual(
        "+11234567890"
      )
    })

    it("should allow phone numbers in the format (***) ***-****", () => {
      expect(USPhoneNumber.parse("(123) 456-7890")?.e164Formatted).toEqual(
        "+11234567890"
      )
    })

    it("should parse e.164 formatted phone numbers", () => {
      expect(USPhoneNumber.parse("+11234567890")?.e164Formatted).toEqual(
        "+11234567890"
      )
    })

    test("privacy formatted", () => {
      const phoneNumber = USPhoneNumber.parse("9258881234")!
      expect(phoneNumber.formattedForPrivacy).toEqual("(***) ***-1234")
    })
  })

  describe("IncrementalPhoneNumberFormatting test", () => {
    test("incremental phone number formatting", () => {
      expect(prettyFormatIncrementalE164PhoneNumber("")).toEqual("")
      expect(prettyFormatIncrementalE164PhoneNumber("1")).toEqual("1")
      expect(prettyFormatIncrementalE164PhoneNumber("12")).toEqual("12")
      expect(prettyFormatIncrementalE164PhoneNumber("123")).toEqual("123")
      expect(prettyFormatIncrementalE164PhoneNumber("1234")).toEqual("(123) 4")
      expect(prettyFormatIncrementalE164PhoneNumber("12345")).toEqual(
        "(123) 45"
      )
      expect(prettyFormatIncrementalE164PhoneNumber("123456")).toEqual(
        "(123) 456"
      )
      expect(prettyFormatIncrementalE164PhoneNumber("1234567")).toEqual(
        "(123) 456-7"
      )
      expect(prettyFormatIncrementalE164PhoneNumber("12345678")).toEqual(
        "(123) 456-78"
      )
      expect(prettyFormatIncrementalE164PhoneNumber("123456789")).toEqual(
        "(123) 456-789"
      )
      expect(prettyFormatIncrementalE164PhoneNumber("1234567890")).toEqual(
        "(123) 456-7890"
      )
      expect(prettyFormatIncrementalE164PhoneNumber("12345678901")).toEqual(
        "(123) 456-78901"
      )
    })
  })
})
