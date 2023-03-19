import { EventColors, SaveEventRequest } from "../../lib/events"
import { FixedDateRange } from "../../lib/Date"
import { LocationCoordinate2D } from "../../lib/location"

export type EventFormPlacemarkInfo = {
  readonly name?: string
  readonly address?: string
}

export type EventFormLocationInfo = {
  readonly coordinates: LocationCoordinate2D
  readonly placemarkInfo?: EventFormPlacemarkInfo
}

/**
 * Values held by an `EventForm`.
 */
export type EventFormValues = {
  readonly title: string
  readonly description: string
  readonly locationInfo?: EventFormLocationInfo
  readonly dateRange: FixedDateRange
  readonly color: EventColors
  readonly shouldHideAfterStartDate: boolean
  readonly radiusMeters: number
}

/**
 * Converts valid `EventFormValues` into an `EditEventInput` type.
 */
export const eventEditInputFromFormValues = (values: EventFormValues) => {
  if (values.title.length === 0 || !values.locationInfo) return undefined
  return {
    title: values.title,
    description: values.description.length > 0 ? values.description : undefined,
    coordinates: values.locationInfo.coordinates,
    dateRange: values.dateRange,
    color: values.color,
    shouldHideAfterStartDate: values.shouldHideAfterStartDate,
    radiusMeters: values.radiusMeters
  } as SaveEventRequest
}
