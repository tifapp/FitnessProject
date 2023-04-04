import { FixedDateRange } from "@lib/Date"
import { LocationCoordinate2D } from "@lib/location"
import { EventColors } from "./Event"

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
