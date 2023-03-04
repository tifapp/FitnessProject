/**
 * Colors that can be used for customizing events.
 */
export namespace EventColors {
  export const Red = "#EF6351"
  export const Purple = "#CB9CF2"
  export const Blue = "#88BDEA"
  export const Green = "#72B01D"
  export const Pink = "#F7B2BD"
  export const Orange = "#F4845F"
  export const Yellow = "#FDE36C"

  /**
   * All supported event colors.
   */
  export const all = [Red, Orange, Yellow, Pink, Purple, Blue, Green]
}

/**
 * A type for the color value for an event.
 */
export type EventColor =
  | typeof EventColors.Red
  | typeof EventColors.Green
  | typeof EventColors.Blue
  | typeof EventColors.Pink
  | typeof EventColors.Purple
  | typeof EventColors.Yellow
  | typeof EventColors.Orange
