import { EmailAddress, USPhoneNumber, Password } from "./Models"

describe("AuthModels tests", () => {
  describe("Password tests", () => {
    it("should fail with a too-short error reason, when the text is less than 8 characters", () => {
      const givenPassword = "Ch1c$en"
      expect(Password.validate(givenPassword)).toBeUndefined()
    })

    it("should succeed, when all of the conditions are met", () => {
      const givenPassword = "waterBottle56$"
      expect(Password.validate(givenPassword)?.rawValue).toEqual(givenPassword)
    })
  })

  describe("EmailAddress tests", () => {
    test("formattedForPrivacy", () => {
      expect(EmailAddress.peacock69.formattedForPrivacy).toEqual(
        "p***9@gmail.com"
      )
    })

    test("formattedForPrivacy 1 character", () => {
      expect(EmailAddress.parse("a@hotmail.com")!.formattedForPrivacy).toEqual(
        "a***a@hotmail.com"
      )
    })
  })

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
})
