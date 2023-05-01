export namespace StringUtils {
  /**
   * Captitalizes the first letter in a given string.
   */
  export const capitalizeFirstLetter = (str: string) => {
    return str[0].toUpperCase() + str.slice(1)
  }
}
