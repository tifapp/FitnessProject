/**
 * A type that guarantees a string is a valid password.
 *
 * A valid password simply contains 8 characters.
 */
export class Password {
  public readonly rawValue: string

  private constructor (rawValue: string) {
    this.rawValue = rawValue
  }

  toString () {
    return this.rawValue
  }

  /**
   * Attempts to validate a raw string as a valid {@link Password}, or returns `undefined` if invalid.
   *
   * A valid password simply contains 8 characters.
   */
  static validate (rawValue: string) {
    return rawValue.length < 8 ? undefined : new Password(rawValue)
  }
}
