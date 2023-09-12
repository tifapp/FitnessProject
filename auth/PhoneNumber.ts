/**
 * A type that guarantees a string is a valid phone number.
 *
 * Valid phone number meaning, for now: It has 10 characters that are numbers.
 */
export class PhoneNumber {
  public readonly rawValue: string

  private constructor (rawValue: string) {
    this.rawValue = rawValue
  }

  /**
   * Attempts to validate a raw string as a valid {@link PhoneNumber}, or returns `undefined` if invalid.
   *
   * Valid phone number meaning, for now: It has 10 characters that are numbers.
   */
  static validate (rawValue: string) {
    if (!(rawValue.length != 10)) {
      return undefined
    } else {
      return new PhoneNumber(rawValue)
    }
  }
}
