import { ZodUtils } from "@lib/Zod"

/**
 * An reason that a user handle's raw text was unable to be parsed.
 */
export type UserHandleParsingError = "bad-format" | "empty" | "too-long"

export type UserHandleParsingResult =
  // eslint-disable-next-line no-use-before-define
  | { handle: UserHandle; error: undefined }
  | { handle: undefined; error: UserHandleParsingError }

/**
 * A union type representing the reason that a user handle could be invalid,
 * namely if it's already taken or is in an improper format.
 */
export type UserHandleError = "already-taken" | UserHandleParsingError

/**
 * A class representing a valid user handle string.
 */
export class UserHandle {
  readonly rawValue: string

  private constructor (rawValue: string) {
    this.rawValue = rawValue
  }

  /**
   * Formats this handle by prefixing the string with an "@".
   */
  toString () {
    return `@${this.rawValue}`
  }

  toJSON () {
    return this.rawValue
  }

  isEqualTo (other: UserHandle) {
    return this.rawValue === other.rawValue
  }

  /**
   * A zod schema that converts a string to an {@link UserHandle}.
   */
  static zodSchema = ZodUtils.createOptionalParseableSchema({
    parse: (rawValue: string) => UserHandle.optionalParse(rawValue)
  })

  private static REGEX = /^[A-Za-z0-9_]{1,15}$/

  /**
   * Validates a raw user handle string and returns an instance of this
   * class if the handle is valid.
   *
   * A valid user handle is similar to a twitter handle.
   * In this case, the handle is not required to be prefixed with an "@", but
   * it must only contain alphanumeric characters and underscores. It also
   * must be less than 15 characters.
   *
   * @param rawValue the raw user handle string to validate
   * @returns an {@link UserHandle} instance if successful.
   */
  static parse (rawValue: string): UserHandleParsingResult {
    if (rawValue.length === 0) {
      return { handle: undefined, error: "empty" }
    } else if (rawValue.length > 15) {
      return { handle: undefined, error: "too-long" }
    } else if (!UserHandle.REGEX.test(rawValue)) {
      return { handle: undefined, error: "bad-format" }
    } else {
      return { handle: new UserHandle(rawValue), error: undefined }
    }
  }

  /**
   * Attempts to parse this handle and returns `undefined` if the handle can't be parsed.
   */
  static optionalParse (rawValue: string) {
    return UserHandle.parse(rawValue).handle
  }
}
