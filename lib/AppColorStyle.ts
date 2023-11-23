import { ColorString } from "./Color"

export namespace AppStyles {
  export const darkColor = ColorString.primaryDarkColor.toString()
  export const colorOpacity15 = ColorString.primaryDarkColor
    .withOpacity(0.15)
    .toString()
  export const colorOpacity50 = ColorString.primaryDarkColor
    .withOpacity(0.5)
    .toString()
  export const colorOpacity35 = ColorString.primaryDarkColor
    .withOpacity(0.35)
    .toString()
  export const errorColor = "#EA4335"
  export const highlightedText = "#4285F4"
  export const eventCardColor = "#F4F4F6"
  export const eventCardBorder = "rgba(145, 145, 145, 0.2)"
  export const linkColor = "#4287f5"
}
