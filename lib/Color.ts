import { ZodUtils } from "./Zod"

/**
 * A simple type to ensure that a hex color string takes somewhat the shape
 * of a hex string.
 *
 * While it would be nice to limit the characters in the string to only valid
 * hex characters, it seems the typescript compiler went on strike when such
 * an attempt was made...
 */
export type HexColor = `#${string}`

/**
 * An easy way to manipulate characteristics of color strings (Alpha, RGB, etc.).
 */
export class ColorString {
  private readonly rgbHexString: string
  readonly opacity: number

  private constructor (rgbaHexString: string, opacity: number) {
    this.rgbHexString = rgbaHexString
    this.opacity = opacity
  }

  /**
   * Returns a new {@link ColorString} instance with the set opacity.
   *
   * @param value a number in the range from 0 to 1
   */
  withOpacity (value: number) {
    return new ColorString(this.rgbHexString, value)
  }

  /**
   * Outputs this string in hex omitting the alpha if `opacity` is 1.
   */
  toString () {
    const opacityHexString =
      this.opacity === 1 ? "" : Math.ceil(255 * this.opacity).toString(16)
    return this.rgbHexString + opacityHexString
  }

  private static RGB_LENGTH = 7
  private static REGEX = /^#([a-f0-9]{2}){3,4}$/i

  /**
   * Parses a color string from a hex rgb or rgba string.
   *
   * Ex.
   *
   * `#aabbcc -> ✅`
   *
   * `#123456aa -> ✅`
   *
   * `#123456AA -> ✅` (Case insensitive)
   *
   * `123456AA -> 🔴` (Needs #)
   */
  static parse (hexString: string) {
    if (!ColorString.REGEX.test(hexString)) return undefined
    return new ColorString(
      hexString.substring(0, ColorString.RGB_LENGTH),
      hexString.length === ColorString.RGB_LENGTH
        ? 1
        : normalizeFrom0To1(hexString.substring(ColorString.RGB_LENGTH))
    )
  }

  static primaryDarkColor = ColorString.parse("#26282A")!

  static zodSchema = ZodUtils.createOptionalParseableSchema(ColorString)
}

const normalizeFrom0To1 = (hexString: string) => {
  return (parseInt(hexString, 16) & 0xff) / 255
}
