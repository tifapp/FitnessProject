import { StringUtils } from "@lib/String"

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

  private static E164_REGEX = /^(\+1)?\d{10}$/
  private static PRETTY_FORMAT_REGEX = /^\(\d{3}\) \d{3}-\d{4}$/

  static mock = USPhoneNumber.parse("(123) 456-7890")!

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
    if (USPhoneNumber.E164_REGEX.test(rawValue)) {
      return new USPhoneNumber(
        rawValue.startsWith("+1") ? rawValue.slice(2) : rawValue
      )
    } else if (USPhoneNumber.PRETTY_FORMAT_REGEX.test(rawValue)) {
      return new USPhoneNumber(StringUtils.extractNumbers(rawValue))
    } else {
      return undefined
    }
  }
}

/**
 * Formates an incremental E164 phone number string as a pretty formatted phone number.
 *
 * Ex.
 *
 * `"1234" -> "(123) 4"`
 *
 * `"1234567" -> "(123) 456-7"`
 */
export const prettyFormatIncrementalE164PhoneNumber = (
  digitString: `${number}` | ""
) => {
  if (digitString.length < 4) {
    return digitString
  } else if (digitString.length < 7) {
    return `(${digitString.substring(0, 3)}) ${digitString.slice(3)}`
  } else {
    return `(${digitString.substring(0, 3)}) ${digitString.substring(
      3,
      6
    )}-${digitString.slice(6)}`
  }
}
