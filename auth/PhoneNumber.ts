/**
 * A data class representing a US Phone Number.
 *
 * In this case, the phone number is a precise 10 digit string.
 */
export class USPhoneNumber {
  private readonly rawValue: string

  private constructor (rawValue: string) {
    this.rawValue = rawValue
  }

  private static REGEX = /^\d{10}$/

  /**
   * Formats this phone number in a way such that it can be used on privacy
   * centric screens (eg. verification code, settings).
   */
  get formattedForPrivacy () {
    return `+1 (***) ***-${this.rawValue.substring(6)}`
  }

  toString () {
    return this.rawValue
  }

  /**
   * Attempts to parse an {@link USPhoneNumber} from a raw string and returns undefined
   * if it fails to parse the string.
   *
   * A valid phone number string is precisely an exact 10 character, numerical string.
   */
  static parse (rawValue: string) {
    return USPhoneNumber.REGEX.test(rawValue)
      ? new USPhoneNumber(rawValue)
      : undefined
  }
}
