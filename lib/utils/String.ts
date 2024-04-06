export namespace StringUtils {
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
}
