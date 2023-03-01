import { HexColor } from "@lib/Color"

/**
 * Colors that can be used for customizing events.
 */
export namespace EventColors {
  export const Turquoise: HexColor = "#84DCC6"
  export const Orange: HexColor = "#FF8811"
  export const Red: HexColor = "#FF4949"
  export const LightPurple: HexColor = "#CB9CF2"
  export const Blue: HexColor = "#1E96FC"
  export const Yellow: HexColor = "#F0C808"
  export const BrightPink: HexColor = "#F9627D"
  export const LightBlue: HexColor = "#85C7F2"
  export const Purple: HexColor = "#9368B7"
  export const Green: HexColor = "#2BC016"
  export const Brown: HexColor = "#8B635C"
  export const CherryBlossom: HexColor = "#F7B2BD"

  /**
   * All supported event colors.
   */
  export const all = [
    Red,
    Orange,
    Yellow,
    BrightPink,
    CherryBlossom,
    LightBlue,
    LightPurple,
    Blue,
    Purple,
    Turquoise,
    Green,
    Brown
  ]
}
