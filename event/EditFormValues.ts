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

/**
 * Returns an object containing default values for the edit event form.
 */
export const defaultEditFormValues = (): EditEventFormValues => ({
  title: "",
  description: "",
  location: undefined,
  startDateTime: new Date(),
  duration: 3600,
  shouldHideAfterStartDate: false
})

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

export type RouteableEditEventFormValues = Reassign<
  EditEventFormValues,
  "startDateTime",
  string
>

/**
 * Returns the specifed {@link EditEventFormValues} in a manner that's suitable for use as a
 * react-navigation route parameter object.
 */
export const toRouteableEditFormValues = (
  values: EditEventFormValues
): RouteableEditEventFormValues => ({
  ...values,
  startDateTime: values.startDateTime.toISOString()
})

/**
 * Returns the specifed {@link RouteableEditEventFormValues} as a canonical
 * {@link EditEventFormValues}.
 */
export const fromRouteableEditFormValues = (
  values: RouteableEditEventFormValues
): EditEventFormValues => ({
  ...values,
  startDateTime: new Date(values.startDateTime)
})
