export const validatePassword = (password: string) => {
  const passwordRegexCapital = /^(?=.*[A-Z])$/
  const passwordRegexSpecialChar = /^(?=.*[!@#$%^&*])$/
  const passwordRegexNumber = /^(?=.*[0-9])$/
  const passwordRegexMinimumLength = /^{8,}$/

  if (
    passwordRegexCapital.test(password) &&
    passwordRegexSpecialChar.test(password) &&
    passwordRegexNumber.test(password) &&
    passwordRegexMinimumLength.test(password)
  ) {
    return true
  } else {
    return false
  }
}
