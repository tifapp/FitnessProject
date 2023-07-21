import { Password } from "@lib/Password"

describe("Password tests", () => {
  it("should fail with a no-capitals error reason, when the text doesn't have any capitals", () => {
    const givenPassword = "ilovepie"
    expect(Password.validate(givenPassword)).toBeUndefined()
  })

  it("should fail with a no-special-chars error reason, when the text doesn't have any special characters", () => {
    const givenPassword = "FinalCountdown32"
    expect(Password.validate(givenPassword)).toBeUndefined()
  })

  it("should fail with a no-numbers error reason, when the text doesn't have any numbers", () => {
    const givenPassword = "zodMod$"
    expect(Password.validate(givenPassword)).toBeUndefined()
  })

  it("should fail with a too-short error reason, when the text is less than 8 characters", () => {
    const givenPassword = "Ch1c$en"
    expect(Password.validate(givenPassword)).toBeUndefined()
  })

  it("should succeed, when all of the conditions are met", () => {
    const givenPassword = "waterBottle56$"
    expect(Password.validate(givenPassword)?.rawValue).toEqual(givenPassword)
  })
})
