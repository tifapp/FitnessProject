import { ColorString } from "TiFShared/domain-models/ColorString"

const blackColor = ColorString.parse("#011224")!

export namespace AppStyles {
  export const primaryColor = blackColor.toString()
  export const colorOpacity15 = blackColor.withOpacity(0.15).toString()
  export const colorOpacity50 = blackColor.withOpacity(0.5).toString()
  export const colorOpacity35 = blackColor.withOpacity(0.35).toString()
  export const errorColor = "#EA4335"
  export const highlightedText = "#4285F4"
  export const cardColor = "#f2f2f8"
  export const eventCardBorder = "rgba(145, 145, 145, 0.2)"
  export const linkColor = "#4287f5"
  export const primary = blackColor
  export const blue = ColorString.parse(linkColor)!
  export const red = ColorString.parse("#FB3640")!
  export const yellow = ColorString.parse("#F7CD24")!
  export const green = ColorString.parse("#14B329")!
  export const purple = ColorString.parse("#A882DD")!
  export const orange = ColorString.parse("#FB5607")!
}
