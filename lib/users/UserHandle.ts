/**
 * An reason that a user handle's raw text was unable to be parsed.
 */
export type UnparseableUserHandleReason = "bad-format" | "empty" | "too-long"

export type ParseUserHandleResult =
  // eslint-disable-next-line no-use-before-define
  | { handle: UserHandle; error: undefined }
  | { handle: undefined; error: UnparseableUserHandleReason }

/**
 * A union type representing the reason that a user handle could be invalid,
 * namely if it's already taken or is in an improper format.
 */
export type InvalidUserHandleReason =
  | "already-taken"
  | UnparseableUserHandleReason

const USER_HANDLE_REGEX = /^@[A-Za-z0-9_]{1,15}$/
const UNPREFIXED_USER_HANDLE_REGEX = /^[A-Za-z0-9_]{1,15}$/

/**
 * Returns true if the given string is a valid user handle.
 *
 * A valid user handle is similar to a twitter handle.
 * It must be prefixed with an "@" and can only contain alphanumeric characters
 * and underscores. It also must be less than 15 characters.
 *
 * ```ts
 * isValidUserHandle("@") // 🔴 false, has no characters after @
 * isValidUserHandle("dkjbd") // 🔴 false, doesn't start with @
 * isValidUserHandle("@+++test+++") // 🔴 false, not alpha numeric
 * isValidUserHandle("@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa") // 🔴 false, too long
 * isValidUserHandle("@why_people") // ✅ true
 * ```
 */
export const isValidUserHandle = (handle: string) => {
  return USER_HANDLE_REGEX.test(handle)
}

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
  static parse (rawValue: string): ParseUserHandleResult {
    if (rawValue.length === 0) {
      return { handle: undefined, error: "empty" }
    } else if (rawValue.length > 15) {
      return { handle: undefined, error: "too-long" }
    } else if (!UNPREFIXED_USER_HANDLE_REGEX.test(rawValue)) {
      return { handle: undefined, error: "bad-format" }
    } else {
      return { handle: new UserHandle(rawValue), error: undefined }
    }
  }
}
