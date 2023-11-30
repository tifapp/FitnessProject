import { UserHandle } from "@content-parsing"
import { uuidString } from "@lib/utils/UUID"
import { CurrentUserEvent, EventAttendee, EventColors } from "./Event"
import { dateRange } from "@date-time"

/**
 * Some mock {@link EventAttendee} objects.
 */
export namespace EventAttendeeMocks {
  export const Alivs = {
    id: uuidString(),
    username: "Alvis",
    handle: UserHandle.optionalParse("alvis")!,
    profileImageURL:
      "https://www.escapistmagazine.com/wp-content/uploads/2023/05/xc3-future-redeemed-alvis.jpg?resize=1200%2C673"
  } as EventAttendee

  export const BlobJr = {
    id: uuidString(),
    username: "Blob Jr.",
    handle: UserHandle.optionalParse("SmallBlob")!
  } as EventAttendee

  export const BlobSr = {
    id: uuidString(),
    username: "Blob Sr.",
    handle: UserHandle.optionalParse("OriginalBlob")!
  } as EventAttendee

  // NB: Unfortunately, we can't reuse Harrison's legendary
  // Anna Admin and Molly Member personas, bc this isn't a book club...
  // (Also Molly died and was replaced with Haley Host...)

  export const AnnaAttendee = {
    id: uuidString(),
    username: "Anna Attendee"
  } as EventAttendee

  export const HaleyHost = {
    id: uuidString(),
    username: "Haley Host"
  } as EventAttendee
}

/**
 * Some mock {@link CurrentUserEvent} objects.
 */
export namespace EventMocks {
  export const PickupBasketball = {
    host: EventAttendeeMocks.Alivs,
    id: uuidString(),
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
    id: uuidString(),
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
    id: uuidString(),
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
