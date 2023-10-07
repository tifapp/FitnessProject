import { Password } from "@auth/Password"

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
