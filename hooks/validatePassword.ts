export const validatePassword = (password: string, passwordRegex: RegExp) => {
  return passwordRegex.test(password)
}
