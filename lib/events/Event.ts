import { dateRange, FixedDateRange } from "@lib/date"
import { LocationCoordinate2D, Placemark } from "@lib/location"
import { uuid } from "@lib/uuid"

/**
 * A type for determining whether or not the user is a host,
 * attendee, or a non-participant of an event.
 */
export type EventCurrentUserAttendeeStatus =
  | "hosting"
  | "attending"
  | "not-participating"

/**
 * Returns true if the status indicates that the user is hosting the event.
 */
export const isHostingEvent = (
  attendeeStatus: EventCurrentUserAttendeeStatus
) => attendeeStatus === "hosting"

/**
 * Returns true if the status indicates that the user is either hosting or
 * attending the event.
 */
export const isAttendingEvent = (
  attendeeStatus: EventCurrentUserAttendeeStatus
) => attendeeStatus !== "not-participating"

/**
 * A type for the color value for an event.
 */
export enum EventColors {
  Red = "#EF6351",
  Purple = "#CB9CF2",
  Blue = "#88BDEA",
  Green = "#72B01D",
  Pink = "#F7B2BD",
  Orange = "#F4845F",
  Yellow = "#F6BD60"
}

/**
 * A user who is attending an event.
 */
export type EventAttendee = Readonly<{
  id: string
  username: string
}>

/**
 * Some mock {@link EventAttendee} objects.
 */
export namespace EventAttendeeMocks {
  export const Blob = {
    id: uuid(),
    username: "Blob"
  } as EventAttendee

  export const BlobJr = {
    id: uuid(),
    username: "Blob Jr."
  } as EventAttendee

  export const BlobSr = {
    id: uuid(),
    username: "Blob Sr."
  } as EventAttendee

  // NB: Unfortunately, we can't reuse Harrison's legendary
  // Anna Admin and Molly Member personas, bc this isn't a book club...
  // (Also Molly died and was replaced with Haley Host...)

  export const AnnaAttendee = {
    id: uuid(),
    username: "Anna Attendee"
  } as EventAttendee

  export const HaleyHost = {
    id: uuid(),
    username: "Haley Host"
  } as EventAttendee
}

/**
 * An event type containing information about the host and number of attendees.
 */
export type Event = Readonly<{
  host: EventAttendee
  id: string
  title: string
  description?: string
  dateRange: FixedDateRange
  color: EventColors
  coordinates: LocationCoordinate2D
  placemark?: Placemark
  shouldHideAfterStartDate: boolean
  attendeeCount: number
  userAttendeeStatus: EventCurrentUserAttendeeStatus
  userMilesFromEvent: number
}>

/**
 * Some mock {@link Event} objects.
 */
export namespace EventMocks {
  export const PickupBasketball = {
    host: EventAttendeeMocks.Blob,
    id: uuid(),
    title: "Pickup Basketball",
    description: "I'm better than Lebron James.",
    dateRange: dateRange(
      new Date("2023-03-18T12:00:00"),
      new Date("2023-03-18T13:00:00")
    ),
    color: EventColors.Orange,
    coordinates: {
      latitude: 36.994621,
      longitude: -122.064537
    },
    placemark: {
      name: "Basketball Court",
      city: "Santa Cruz",
      region: "CA",
      postalCode: "95064"
    },
    shouldHideAfterStartDate: false,
    userAttendeeStatus: "attending",
    userMilesFromEvent: 12.7892
  } as Event

  export const Multiday = {
    host: EventAttendeeMocks.Blob,
    id: uuid(),
    title: "Multiday Event",
    description: "This event runs for more than one day.",
    dateRange: dateRange(
      new Date("2023-03-18T12:00:00"),
      new Date("2023-03-21T12:00:00")
    ),
    color: EventColors.Purple,
    coordinates: {
      latitude: 55.862634,
      longitude: -4.280214
    },
    placemark: {
      name: "McDonalds",
      city: "Glasgow",
      region: "Scotland",
      postalCode: "G3 8JU"
    },
    shouldHideAfterStartDate: false,
    userAttendeeStatus: "attending",
    userMilesFromEvent: 12.7892
  } as Event

  export const NoPlacemarkInfo = {
    host: EventAttendeeMocks.Blob,
    id: uuid(),
    title: "No Placemark Info",
    description:
      "The placemark info should then be geocoded from the coordinates if it is not available." +
      "(ie. Our AWS backend still needs to geocode it) The result in this case should be somewhere in New York.",
    dateRange: dateRange(
      new Date("2023-03-18T12:00:00"),
      new Date("2023-03-18T15:00:00")
    ),
    color: EventColors.Green,
    coordinates: {
      latitude: 40.777874,
      longitude: -73.969717
    },
    shouldHideAfterStartDate: false,
    userAttendeeStatus: "attending",
    userMilesFromEvent: 12.7892
  } as Event
}
