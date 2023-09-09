import { Email } from "@auth/Email"

describe("Password tests", () => {
  it("should not succeed, when it does not have a @ inside of the string", () => {
    const givenEmail = "i.com"
    expect(Email.validate(givenEmail)).toBeUndefined()
  })

  it("should succeed, when it has a @ inside of the string", () => {
    const givenEmail = "waterBottle@walak.com"
    expect(Email.validate(givenEmail)?.rawValue).toEqual(givenEmail)
  })
})
