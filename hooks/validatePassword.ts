export const validateNewPassword = (password: string) => {
  const passwordRegexCapital = /(?=.*[A-Z]).*/
  const passwordRegexSpecialChar = /(?=.*[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/
  const passwordRegexNumber = /(?=\D*\d)\S+/
  const passwordRegexMinimumLength = /^.{8,}$/

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
