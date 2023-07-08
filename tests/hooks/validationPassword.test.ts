import { validationProcedure } from "@hooks/validationMethods"

const passwordValidation = (password: string) => {
  const passwordRegex = /^.{6,}$/
  return passwordRegex.test(password)
}

const newPassword = "Sixcha"

describe("validation tests", () => {
  it("should validate using a basic regex: at least 6", () => {
    expect(validationProcedure(passwordValidation, newPassword)).toEqual(true)
  })
})
