import { FixedDateRange } from "TiFShared/domain-models/FixedDateRange"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"

// TODO: - Move this out of Lib

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
 * A data type which is used to update and create an event.
 */
export type SaveEventRequest = Readonly<{
  title: string
  description?: string
  coordinates: LocationCoordinate2D
  color: EventColors
  dateRange: FixedDateRange
  shouldHideAfterStartDate: boolean
  radiusMeters: number
}>
