const passwordRegexCapital = /(?=.*[A-Z]).*/
const passwordRegexSpecialChar = /(?=.*[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/
const passwordRegexNumber = /(?=\D*\d)\S+/
const passwordRegexMinimumLength = /^.{8,}$/

/**
 * A type that guarantees a string is a valid password.
 *
 * Valid password meaning: At least 8 characters, at least 1 capital letter, at least 1 number, and at least 1 special character.
 */
export class Password {
  readonly rawValue: string

  private constructor (rawValue: string) {
    this.rawValue = rawValue
  }

  // Returns an object with the status of the validation, and either a reason for its failure, or the password if it is valid.
  static validate (rawValue: string): PasswordValidationResult {
    if (!passwordRegexCapital.test(rawValue)) {
      return { status: "invalid", errorReason: "no-capitals" }
    } else if (!passwordRegexSpecialChar.test(rawValue)) {
      return { status: "invalid", errorReason: "no-special-chars" }
    } else if (!passwordRegexNumber.test(rawValue)) {
      return { status: "invalid", errorReason: "no-numbers" }
    } else if (rawValue.length < 8) {
      return { status: "invalid", errorReason: "too-short" }
    } else {
      return { status: "valid", password: new Password(rawValue) }
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

export const validateNewPassword = (password: string) => {
  const isValidPassword =
    passwordRegexCapital.test(password) &&
    passwordRegexSpecialChar.test(password) &&
    passwordRegexNumber.test(password) &&
    password.length >= 8
  return isValidPassword
}
