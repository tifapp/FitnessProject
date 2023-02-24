import { HexColor } from "@lib/Color"
import { EventUpdateInput } from "@lib/events"
import { Location } from "@lib/location"

/**
 * A type that is used by the event form components.
 */
export type EventFormValues = {
  readonly title: string
  readonly description: string
  readonly location?: Location
  readonly startDate: Date
  readonly endDate: Date
  readonly color: HexColor
  readonly shouldHideAfterStartDate: boolean
  readonly radiusMeters: number
}

/**
 * Parses an `EventUpdateInput` type from `EventFormValues`.
 *
 * @returns a `EventUpdateInput` instance or `undefined` if the values are invalid.
 */
export const eventUpdateInputFromValues = (values: EventFormValues) => {
  if (values.title.length === 0 || !values.location) return undefined
  return {
    title: values.title,
    description: values.description.length > 0 ? values.description : undefined,
    location: values.location,
    startDate: values.startDate,
    endDate: values.endDate,
    color: values.color,
    shouldHideAfterStartDate: values.shouldHideAfterStartDate,
    radiusMeters: values.radiusMeters
  } as EventUpdateInput
}
