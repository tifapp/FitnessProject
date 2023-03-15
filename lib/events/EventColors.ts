import { z } from "zod"

/**
 * A type for the color value for an event.
 */
export enum EventColors {
  Red = "#EF6351",
  Purple = "#CB9CF2",
  Blue = "#88BDEA",
  Green = "#72B01D",
  Pink = "#F7B2BD",
  Orange = "#F4845F",
  Yellow = "#F6BD60"
}

/**
 * A zod schema for {@link EventColors}.
 */
export const EventColorsSchema = z
  .enum(Object.values(EventColors) as [string, ...string[]])
  .transform((val) => val as EventColors)
