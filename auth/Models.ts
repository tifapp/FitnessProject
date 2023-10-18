import { z } from "zod"
import { StringUtils } from "@lib/String"

/**
 * An interface for describing how something can be formatted with respect to privacy.
 */
export interface PrivacyFormattable {
  get formattedForPrivacy(): string
}

const RawStringEmailAddressSchema = z.string().email()

/**
 * A data type representing a valid email address.
 */
export class EmailAddress implements PrivacyFormattable {
  static peacock69 = EmailAddress.parse("peacock69@gmail.com")!

  private readonly rawValue: string

  private constructor (rawValue: string) {
    this.rawValue = rawValue
  }

  /**
   * Formats this email address in a privacy centric way.
   *
   * (eg. peacock69@gmail.com -> p***9@gmail.com)
   */
  get formattedForPrivacy () {
    const privacySuffix = this.rawValue.substring(
      this.rawValue.indexOf("@") - 1
    )
    return `${this.rawValue[0]}***${privacySuffix}`
  }

  toString () {
    return this.rawValue
  }

  /**
   * Attempts to parse a raw string as an {@link EmailAddress} and returns undefined
   * if it is unable to parse the email.
   */
  static parse (rawValue: string) {
    const parseResult = RawStringEmailAddressSchema.safeParse(rawValue)
    return parseResult.success ? new EmailAddress(parseResult.data) : undefined
  }
}

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

/**
 * A data class representing a US Phone Number.
 *
 * In this case, the phone number is a precise 10 digit string.
 */
export class USPhoneNumber implements PrivacyFormattable {
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
