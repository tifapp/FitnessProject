import { Email } from "@auth/Email"

describe("Password tests", () => {
  it("should fail with a no-capitals error reason, when the text doesn't have any capitals", () => {
    const givenEmail = "i.com"
    expect(Email.validate(givenEmail)).toBeUndefined()
  })

  it("should succeed, when it has a @ inside of the string", () => {
    const givenEmail = "waterBottle@walak.com"
    expect(Email.validate(givenEmail)?.rawValue).toEqual(givenEmail)
  })
})
