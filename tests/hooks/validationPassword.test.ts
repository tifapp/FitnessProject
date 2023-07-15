import { validateNewPassword } from "@hooks/validatePassword"

describe("validation tests", () => {
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
})
