import { HexColorPickerOption } from "../formComponents/HexColorPicker"
import { EventColor, EventColors } from "../../lib/events/EventColors"
import { FixedDateRange } from "../../lib/Date"
import { EditEventInput } from "../../lib/events"
import { Location } from "../../lib/location"

export type EventFormPlacemarkInfo = {
  readonly name?: string
  readonly address?: string
}

export type EventFormLocationInfo = {
  readonly coordinates: Location
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
  readonly color: EventColor
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
    location: values.locationInfo.coordinates,
    dateRange: values.dateRange,
    color: values.color,
    shouldHideAfterStartDate: values.shouldHideAfterStartDate,
    radiusMeters: values.radiusMeters
  } as EditEventInput
}

export const eventColorOptions = [
  { color: EventColors.Red, accessibilityLabel: "Red" },
  { color: EventColors.Orange, accessibilityLabel: "Orange" },
  { color: EventColors.Pink, accessibilityLabel: "Pink" },
  { color: EventColors.Yellow, accessibilityLabel: "Yellow" },
  { color: EventColors.Green, accessibilityLabel: "Green" },
  { color: EventColors.Purple, accessibilityLabel: "Purple" },
  { color: EventColors.Blue, accessibilityLabel: "Blue" }
] as HexColorPickerOption<EventColor>[]
