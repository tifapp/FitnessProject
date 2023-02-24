import { HexColor } from "@lib/Color"
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
