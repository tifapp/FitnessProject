const CAPITAL_REGEX = /(?=.*[A-Z]).*/
// eslint-disable-next-line no-useless-escape
const SPECIAL_CHARACTER_REGEX = /(?=.*[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/
const NUMBER_REGEX = /(?=\D*\d)\S+/

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

  /**
   * Attempts to validate a raw string as a valid {@link Password}, or returns `undefined` if invalid.
   *
   * Valid password meaning: At least 8 characters, at least 1 capital letter, at least 1 number, and at least 1 special character.
   */
  static validate (rawValue: string) {
    if (
      !CAPITAL_REGEX.test(rawValue) ||
      !SPECIAL_CHARACTER_REGEX.test(rawValue) ||
      !NUMBER_REGEX.test(rawValue) ||
      rawValue.length < 8
    ) {
      return undefined
    } else {
      return new Password(rawValue)
    }
  }
}
