import { z } from "zod"

const RawStringEmailAddressSchema = z.string().email()

/**
 * A data type representing a valid email address.
 */
export class EmailAddress {
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
