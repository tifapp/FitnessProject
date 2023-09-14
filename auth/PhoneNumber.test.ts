import { USPhoneNumber } from "./PhoneNumber"

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

    it("should only allow parse phone numbers with exactly 10 digits", () => {
      expect(USPhoneNumber.parse("1234567890")?.toString()).toEqual(
        "1234567890"
      )
    })

    test("privacy formatted", () => {
      const phoneNumber = USPhoneNumber.parse("9258881234")!
      expect(phoneNumber.formattedForPrivacy).toEqual("(***) ***-1234")
    })
  })
})
