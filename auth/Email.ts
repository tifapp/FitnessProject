/**
 * A type that guarantees a string is a valid email.
 *
 * Valid email meaning, for now: It has an @ symbol.
 */
export class Email {
  public readonly rawValue: string

  private constructor (rawValue: string) {
    this.rawValue = rawValue
  }

  /**
   * Attempts to validate a raw string as a valid {@link Email}, or returns `undefined` if invalid.
   *
   * Valid email meaning, for now: It has an @ symbol.
   */
  static validate (rawValue: string) {
    if (!rawValue.includes("@")) {
      return undefined
    } else {
      return new Email(rawValue)
    }
  }
}
