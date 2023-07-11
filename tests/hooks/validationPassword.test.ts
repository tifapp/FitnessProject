import { validatePassword } from "@hooks/validatePassword"

describe("validation tests", () => {
  const passwordRegexB: RegExp = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/
  const newPassword: string = "Sixcha"
  it("should validate using a basic regex: at least 6. Given: 6", () => {
    const passwordRegexA = /^.{6,}$/
    expect(validatePassword(newPassword, passwordRegexA)).toEqual(true)
  })

  it("should not validate using required regex: at least 8, at least 1 special, at least 1 uppercase, at least 1 number. Given: 6", () => {
    expect(validatePassword(newPassword, passwordRegexB)).toEqual(false)
  })

  it("should result in a success, after validation. Given: old matches current, validate new pass WORKS, reEntered correct", () => {
    const oldAccountPassword: string = "Acting34$"
    const currentAccountPassword: string = "Acting34$"
    const newAccountPassword: string = "$hide34All"
    const reEnteredPassword: string = "$hide34All"

    const validateForm = () => {
      const passwordRegex: RegExp =
        /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/
      const formValid: boolean =
        oldAccountPassword === currentAccountPassword &&
        validatePassword(newAccountPassword, passwordRegex) &&
        reEnteredPassword === newAccountPassword
      return formValid
    }
    expect(validateForm()).toEqual(true)
  })
})
