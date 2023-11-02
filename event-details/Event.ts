import { dateRange, FixedDateRange } from "@lib/date"
import {
  LocationCoordinate2D,
  Placemark,
  placemarkToFormattedAddress
} from "@lib/location"
import { UserHandle, UserToProfileRelationStatus } from "@lib/users"
import { uuid } from "@lib/uuid"
import * as Clipboard from "expo-clipboard"
import { StringUtils } from "@lib/String"
import { ZodUtils } from "@lib/Zod"
import { LinkifyIt } from "linkify-it"
import { showLocation } from "react-native-map-link"

/**
 * A handle that users can reference other events with.
 *
 * Each event has a handle that is generated from its name similar to user handles.
 * Since {@link UserHandle}s are already referenced through the `@` sign, event handles
 * are referenced via `!`.
 *
 * A valid event handle consists of only letters, numbers, and underscores, but
 * must start with a letter and be at least 1 character long.
 */
export class EventHandle {
  static zodSchema = ZodUtils.createOptionalParseableSchema(EventHandle)

  readonly rawValue: string

  private constructor (rawValue: string) {
    this.rawValue = rawValue
  }

  /**
   * Formats this handle by prefixing it with an "!".
   */
  toString () {
    return `!${this.rawValue}`
  }

  private static REGEX = /^[a-zA-Z]{1}[a-zA-Z0-9_]*$/

  /**
   * Attempts to parse an {@link EventHandle} from a raw string.
   *
   * A valid event handle consists of only letters, numbers, and underscores, but
   * must start with a letter and be at least 1 character long.
   *
   * @param rawValue the raw string to attempt to parse.
   * @returns an {@link EventHandle} instance if valid.
   */
  static parse (rawValue: string) {
    return EventHandle.REGEX.test(rawValue)
      ? new EventHandle(rawValue)
      : undefined
  }
}

/**
 * Adds event handle validation to a linkify config.
 *
 * @param linkify see {@link LinkifyIt}
 */
export const linkifyAddEventHandleValidation = (linkify: LinkifyIt) => {
  linkify.add("!", {
    validate: (text: string, pos: number) => {
      const slice = text.slice(pos)
      const handle = slice.split(/\s/)[0] ?? slice

      if (!EventHandle.parse(handle)) return false
      if (pos >= 2 && !StringUtils.isWhitespaceCharacter(text, pos - 2)) {
        return false
      }
      return handle.length
    },
    normalize: (match) => {
      match.url = "tifapp://event/" + match.url.replace(/^!/, "")
    }
  })
}

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
export type EventAttendee = {
  id: string
  username: string
  handle: UserHandle
  profileImageURL?: string
  relationStatus: UserToProfileRelationStatus
}

/**
 * Some mock {@link EventAttendee} objects.
 */
export namespace EventAttendeeMocks {
  export const Alivs = {
    id: uuid(),
    username: "Alvis",
    handle: UserHandle.optionalParse("alvis")!,
    profileImageURL:
      "https://www.escapistmagazine.com/wp-content/uploads/2023/05/xc3-future-redeemed-alvis.jpg?resize=1200%2C673"
  } as EventAttendee

  export const BlobJr = {
    id: uuid(),
    username: "Blob Jr.",
    handle: UserHandle.optionalParse("SmallBlob")!
  } as EventAttendee

  export const BlobSr = {
    id: uuid(),
    username: "Blob Sr.",
    handle: UserHandle.optionalParse("OriginalBlob")!
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
 * The location of an event.
 *
 * Event locations may not have a placemark, this could either be because
 * the event is in the middle of nowhere, or its placemark hasn't been fully
 * decoded for some reason.
 */
export type EventLocation = {
  coordinate: LocationCoordinate2D
  placemark?: Placemark
}

/**
 * Copies an event location to the clipboard.
 *
 * If the event has no formattable placemark, the coordinates are formatted
 * and copied to the clipboard instead of the formatted address of the placemark.
 */
export const copyEventLocationToClipboard = (
  location: EventLocation,
  setClipboardText: (text: string) => Promise<void> = expoCopyTextToClipboard
) => setClipboardText(formatEventLocation(location))

const expoCopyTextToClipboard = async (text: string) => {
  await Clipboard.setStringAsync(text)
}

const formatEventLocation = (location: EventLocation) => {
  const formattedLocationCoordinate = `${location.coordinate.latitude}, ${location.coordinate.longitude}`
  if (!location.placemark) return formattedLocationCoordinate
  const formattedPlacemark = placemarkToFormattedAddress(location.placemark)
  return formattedPlacemark ?? formattedLocationCoordinate
}

/**
 * Opens the event location in the user's preffered maps app.
 *
 * @param location the location to open in maps.
 * @param directionsMode the mehtod of how to link specific directions to the location.
 */
export const openEventLocationInMaps = (
  location: EventLocation,
  directionsMode?: "car" | "walk" | "bike" | "public-transport"
) => {
  showLocation({
    ...location.coordinate,
    title: location.placemark
      ? placemarkToFormattedAddress(location.placemark)
      : undefined,
    directionsMode
  })
}

/**
 * A type representing events that are attended and hosted by users.
 */
export type Event = {
  host: EventAttendee
  id: string
  handle: EventHandle
  title: string
  description: string
  dateRange: FixedDateRange
  color: EventColors
  location: EventLocation
  shouldHideAfterStartDate: boolean
  attendeeCount: number
}

/**
 * A type for determining whether or not a user is a host,
 * attendee, or a non-participant of an event.
 */
export type EventUserAttendeeStatus =
  | "hosting"
  | "attending"
  | "not-participating"

/**
 * Returns true if the status indicates that the user is hosting the event.
 */
export const isHostingEvent = (attendeeStatus: EventUserAttendeeStatus) => {
  return attendeeStatus === "hosting"
}

/**
 * Returns true if the status indicates that the user is either hosting or
 * attending the event.
 */
export const isAttendingEvent = (attendeeStatus: EventUserAttendeeStatus) => {
  return attendeeStatus !== "not-participating"
}

/**
 * An event type that adds additional data on a specific user's
 * perspective of the event.
 */
export type CurrentUserEvent = Event & {
  userAttendeeStatus: EventUserAttendeeStatus
}

/**
 * Some mock {@link CurrentUserEvent} objects.
 */
export namespace EventMocks {
  export const PickupBasketball = {
    host: EventAttendeeMocks.Alivs,
    id: uuid(),
    handle: EventHandle.parse("pickup_basketball1234")!,
    title: "Pickup Basketball",
    description: "I'm better than Lebron James.",
    dateRange: dateRange(
      new Date("2023-03-18T12:00:00"),
      new Date("2023-03-18T13:00:00")
    ),
    color: EventColors.Orange,
    location: {
      coordinate: {
        latitude: 36.994621,
        longitude: -122.064537
      },
      placemark: {
        name: "Basketball Court",
        city: "Santa Cruz",
        region: "CA",
        postalCode: "95064"
      }
    },
    shouldHideAfterStartDate: false,
    attendeeCount: 10,
    userAttendeeStatus: "attending",
    userMilesFromEvent: 12.7892
  } as CurrentUserEvent

  export const Multiday = {
    host: EventAttendeeMocks.Alivs,
    id: uuid(),
    handle: EventHandle.parse("multiday_marathon6666")!,
    title: "Multiday Event",
    description: "This event runs for more than one day.",
    dateRange: dateRange(
      new Date("2023-03-18T12:00:00"),
      new Date("2023-03-21T12:00:00")
    ),
    color: EventColors.Purple,
    location: {
      coordinate: {
        latitude: 55.862634,
        longitude: -4.280214
      },
      placemark: {
        name: "McDonalds",
        city: "Glasgow",
        region: "Scotland",
        postalCode: "G3 8JU"
      }
    },
    shouldHideAfterStartDate: false,
    attendeeCount: 3,
    userAttendeeStatus: "attending",
    userMilesFromEvent: 12.7892
  } as CurrentUserEvent

  export const NoPlacemarkInfo = {
    host: EventAttendeeMocks.Alivs,
    id: uuid(),
    handle: EventHandle.parse("lol")!,
    title: "No Placemark Info",
    attendeeCount: 5,
    description:
      "The placemark info should then be geocoded from the coordinates if it is not available." +
      "(ie. Our AWS backend still needs to geocode it) The result in this case should be somewhere in New York.",
    dateRange: dateRange(
      new Date("2023-03-18T12:00:00"),
      new Date("2023-03-18T15:00:00")
    ),
    color: EventColors.Green,
    location: {
      coordinate: {
        latitude: 40.777874,
        longitude: -73.969717
      }
    },
    shouldHideAfterStartDate: false,
    userAttendeeStatus: "attending",
    userMilesFromEvent: 12.7892
  } as CurrentUserEvent
}
