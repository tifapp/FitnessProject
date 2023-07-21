const passwordRegexCapital = /(?=.*[A-Z]).*/
const passwordRegexSpecialChar = /(?=.*[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/
const passwordRegexNumber = /(?=\D*\d)\S+/

/**
 * A type that guarantees a string is a valid password.
 *
 * Valid password meaning: At least 8 characters, at least 1 capital letter, at least 1 number, and at least 1 special character.
 */
export class Password {
  public readonly rawValue: string

  private constructor (rawValue: string) {
    this.rawValue = rawValue
  }

  // Returns an object with the status of the validation, and either a reason for its failure, or the password if it is valid.
  static validate (rawValue: string) {
    if (
      !passwordRegexCapital.test(rawValue) ||
      !passwordRegexSpecialChar.test(rawValue) ||
      !passwordRegexNumber.test(rawValue) ||
      rawValue.length < 8
    ) {
      return undefined
    } else {
      return new Password(rawValue)
    }
  }
}

export type PasswordValidationResult =
  | { status: "valid"; password: Password }
  | { status: "invalid"; errorReason: PasswordErrorReason }

export type PasswordErrorReason =
  | "no-capitals"
  | "no-special-chars"
  | "no-numbers"
  | "too-short"
  | undefined

export const validateNewPassword = (password: string) => {
  const isValidPassword =
    passwordRegexCapital.test(password) &&
    passwordRegexSpecialChar.test(password) &&
    passwordRegexNumber.test(password) &&
    password.length >= 8
  return isValidPassword
}
