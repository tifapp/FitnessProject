import { Password, validateNewPassword } from "@lib/Password"

describe("Password tests", () => {
  it("should result in a success, after validation. Given: old matches current, validate new pass WORKS, reEntered correct", () => {
    const oldAccountPassword: string = "Acting34$"
    const currentAccountPassword: string = "Acting34$"
    const newAccountPassword: string = "$hide34All"
    const reEnteredPassword: string = "$hide34All"

    const validateForm = () => {
      const formValid: boolean =
        oldAccountPassword === currentAccountPassword &&
        validateNewPassword(newAccountPassword) &&
        reEnteredPassword === newAccountPassword
      return formValid
    }
    expect(validateForm()).toEqual(true)
  })

  it("should fail with a no-capitals error reason, when the text doesn't have any capitals", () => {
    const givenPassword = "ilovepie"
    expect(Password.validate(givenPassword)).toMatchObject({
      status: "invalid",
      errorReason: "no-capitals"
    })
  })

  it("should fail with a no-special-chars error reason, when the text doesn't have any special characters", () => {
    const givenPassword = "FinalCountdown32"
    expect(Password.validate(givenPassword)).toMatchObject({
      status: "invalid",
      errorReason: "no-special-chars"
    })
  })

  it("should fail with a no-numbers error reason, when the text doesn't have any numbers", () => {
    const givenPassword = "zodMod$"
    expect(Password.validate(givenPassword)).toMatchObject({
      status: "invalid",
      errorReason: "no-numbers"
    })
  })

  it("should fail with a too-short error reason, when the text is less than 8 characters", () => {
    const givenPassword = "Ch1c$en"
    expect(Password.validate(givenPassword)).toMatchObject({
      status: "invalid",
      errorReason: "too-short"
    })
  })

  it("should succeed, when all of the conditions are met", () => {
    const givenPassword = "waterBottle56$"
    expect(Password.validate(givenPassword)).toMatchObject({
      status: "valid",
      password: expect.objectContaining({ rawValue: givenPassword })
    })
  })
})
