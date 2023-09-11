import { EmailAddress } from "./Email"

describe("Email tests", () => {
  describe("EmailAddress tests", () => {
    test("formattedForPrivacy", () => {
      const email = EmailAddress.parse("peacock69@gmail.com")!
      expect(email.formattedForPrivacy).toEqual("p***9@gmail.com")
    })
  })
})
