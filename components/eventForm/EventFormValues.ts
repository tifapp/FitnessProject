import { HexColor } from "@lib/Color"
import { Location } from "@lib/location"

export type EventFormPlacemarkInfo = {
  name?: string
  address?: string
}

export type EventFormLocationInfo = {
  coordinates: Location
  placemarkInfo?: EventFormPlacemarkInfo
}

/**
 * A type that is used by the event form components.
 */
export type EventFormValues = {
  readonly title: string
  readonly description: string
  readonly locationInfo?: EventFormLocationInfo
  readonly startDate: Date
  readonly endDate: Date
  readonly color: HexColor
  readonly shouldHideAfterStartDate: boolean
  readonly radiusMeters: number
}
