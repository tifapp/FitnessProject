const IS_VALID_USER_HANDLE_REGEX = /^@[A-Za-z0-9_]{1,15}$/

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
  return IS_VALID_USER_HANDLE_REGEX.test(handle)
}
