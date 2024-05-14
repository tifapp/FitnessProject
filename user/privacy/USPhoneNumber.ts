import { PrivacyFormattable } from "./PrivacyFormattable"
import { extractNumbers } from "TiFShared/lib/String"

/**
 * A data class representing a US Phone Number.
 *
 * In this case, the phone number is a precise 10 digit string.
 */
export class USPhoneNumber implements PrivacyFormattable {
  private readonly rawValue: string

  private constructor(rawValue: string) {
    this.rawValue = rawValue
  }

  private static E164_REGEX = /^(\+1)?\d{10}$/
  private static PRETTY_FORMAT_REGEX = /^\(\d{3}\) \d{3}-\d{4}$/

  static mock = USPhoneNumber.parse("(123) 456-7890")!

  /**
   * Pretty formats this phone number with only the last 4 digits shown.
   *
   * `1234567890 -> (***) ***-7890`
   */
  get formattedForPrivacy() {
    return `(***) ***-${this.rawValue.substring(6)}`
  }

  /**
   * Formats this phone number as an e.164 formatted string.
   *
   * Ex.
   * `(123) 456-7890` -> `+11234567890`
   */
  toString() {
    return `+1${this.rawValue}`
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
  static parse(rawValue: string) {
    if (USPhoneNumber.E164_REGEX.test(rawValue)) {
      return new USPhoneNumber(
        rawValue.startsWith("+1") ? rawValue.slice(2) : rawValue
      )
    } else if (USPhoneNumber.PRETTY_FORMAT_REGEX.test(rawValue)) {
      return new USPhoneNumber(extractNumbers(rawValue))
    } else {
      return undefined
    }
  }
}
