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
    return rawValue.length < 8 ? undefined : new Password(rawValue)
  }
}
