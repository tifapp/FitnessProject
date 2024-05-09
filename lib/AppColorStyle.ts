import { ColorString } from "TiFShared/domain-models/ColorString"

const primaryDarkColor = ColorString.parse("#26282A")!

export namespace AppStyles {
  export const darkColor = primaryDarkColor.toString()
  export const colorOpacity15 = primaryDarkColor.withOpacity(0.15).toString()
  export const veryLightGrey = primaryDarkColor.withOpacity(0.1)
  export const colorOpacity50 = primaryDarkColor.withOpacity(0.5).toString()
  export const colorOpacity35 = primaryDarkColor.withOpacity(0.35).toString()
  export const errorColor = "#EA4335"
  export const highlightedText = "#4285F4"
  export const eventCardColor = "#F4F4F6"
  export const eventCardBorder = "rgba(145, 145, 145, 0.2)"
  export const linkColor = "#4287f5"
  export const black = primaryDarkColor
  export const blue = ColorString.parse(linkColor)!
  export const red = ColorString.parse("#FB3640")!
  export const yellow = ColorString.parse("#F7CD24")!
  export const green = ColorString.parse("#14B329")!
  export const purple = ColorString.parse("#A882DD")!
  export const orange = ColorString.parse("#FB5607")!
}
