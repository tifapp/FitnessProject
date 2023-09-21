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

  /**
   * Pretty formats this phone number with only the last 4 digits shown.
   *
   * `1234567890 -> (***) ***-7890`
   */
  get formattedForPrivacy () {
    return `(***) ***-${this.rawValue.substring(6)}`
  }

  get e164Formatted () {
    return `+1${this.rawValue}`
  }

  toString () {
    return this.rawValue
  }

  /**
   * Attempts to parse an {@link USPhoneNumber} from a raw string and returns undefined
   * if it fails to parse the string.
   *
   * Ex.
   *
   * `1234567890 ✅`
   *
   * `+11234567890 ✅`
   *
   * `(123) 456-7890 ✅`
   */
  static parse (rawValue: string) {
    if (/^(\+1)?\d{10}$/.test(rawValue)) {
      return new USPhoneNumber(
        rawValue.startsWith("+1") ? rawValue.slice(2) : rawValue
      )
    } else if (/^\(\d{3}\) \d{3}-\d{4}$/.test(rawValue)) {
      return new USPhoneNumber(rawValue.replaceAll(/\D/g, ""))
    } else {
      return undefined
    }
  }
}
