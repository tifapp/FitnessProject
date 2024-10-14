import { EmailAddress } from "./EmailAddress"

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
