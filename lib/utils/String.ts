export namespace StringUtils {
  /**
   * Captitalizes the first letter in a given string.
   */
  export const capitalizeFirstLetter = (str: string) => {
    return str[0].toUpperCase() + str.slice(1)
  }

  const WHITESPACE_REGEX = /\s/

  /**
   * Returns true if the the given character in a string is whitespace.
   *
   * @param str the string to check.
   * @param index the index of the character to check.
   */
  export const isWhitespaceCharacter = (str: string, index: number) => {
    return WHITESPACE_REGEX.test(str[index])
  }

  const NON_DIGIT_REGEX = /\D/g

  /**
   * Extracts a numerical string of all the numbers in this string.
   */
  export const extractNumbers = (str: string) => {
    return str.replace(NON_DIGIT_REGEX, "") as `${number}` | ""
  }
}

/**
 * An interface reprsenting types that have a callable `toString` method.
 */
export interface ToStringable {
  toString(): string
}
