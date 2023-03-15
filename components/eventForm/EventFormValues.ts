import { EventColors } from "../../lib/events/EventColors"
import { FixedDateRange } from "../../lib/date"
import { Location } from "../../lib/location"
import { SaveEventInputSchema } from "@lib/events"

export type EventFormPlacemarkInfo = Readonly<{
  name?: string
  address?: string
}>

export type EventFormLocationInfo = Readonly<{
  coordinates: Location
  placemarkInfo?: EventFormPlacemarkInfo
}>

/**
 * Values held by an `EventForm`.
 */
export type EventFormValues = Readonly<{
  id?: string
  title: string
  description: string
  locationInfo?: EventFormLocationInfo
  dateRange: FixedDateRange
  color: EventColors
  shouldHideAfterStartDate: boolean
  radiusMeters: number
}>

/**
 * Converts {@link EventFormValues} to a {@link SaveEventInput} type if possible.
 */
export const eventFormValuesToSaveInput = (values: EventFormValues) => {
  const parsed = SaveEventInputSchema.passthrough().safeParse({
    id: values.id,
    title: values.title,
    dateRange: values.dateRange,
    color: values.color,
    shouldHideAfterStartDate: values.shouldHideAfterStartDate,
    radiusMeters: values.radiusMeters,
    description:
      values.description.length === 0 ? undefined : values.description,
    location: values.locationInfo?.coordinates
  })
  return parsed.success ? parsed.data : undefined
}
