import { FixedDateRange } from "@date-time"
import { LocationCoordinate2D } from "@location"
import { EventColors } from "../../event-details-boundary/Event"

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
