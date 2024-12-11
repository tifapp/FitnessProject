import { EventEdit } from "TiFShared/domain-models/Event"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { Placemark } from "TiFShared/domain-models/Placemark"
import { Reassign } from "TiFShared/lib/Types/HelperTypes"
import { ClientSideEvent } from "./ClientSideEvent"

export type EditEventFormLocation =
  | {
      placemark: Placemark
      coordinate: undefined
    }
  | { placemark: undefined; coordinate: LocationCoordinate2D }
  | { placemark: Placemark; coordinate: LocationCoordinate2D }

export type EditEventFormValues = Reassign<
  Required<EventEdit>,
  "location",
  EditEventFormLocation | undefined
>

export const DEFAULT_EDIT_EVENT_FORM_VALUES = {
  title: "",
  description: "",
  location: undefined,
  startDateTime: new Date(),
  duration: 3600,
  shouldHideAfterStartDate: false
} as const

/**
 * Returns an {@link EditEventFormValues} from an {@link ClientSideEvent}.
 */
export const editFormValues = (
  event: ClientSideEvent
): EditEventFormValues => ({
  title: event.title,
  description: event.description ?? "",
  startDateTime: event.time.dateRange.startDateTime,
  duration: event.time.dateRange.diff.seconds,
  shouldHideAfterStartDate: event.settings.shouldHideAfterStartDate,
  location: {
    coordinate: event.location.coordinate,
    placemark: event.location.placemark
  }
})
