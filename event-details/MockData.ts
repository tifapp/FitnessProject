import { UserHandle } from "@content-parsing"
import { uuidString } from "@lib/utils/UUID"
import {
  CurrentUserEvent,
  EventAttendee,
  EventColors,
  EventLocation
} from "./Event"
import { dateRange } from "@date-time"
import { mockLocationCoordinate2D, mockPlacemark } from "@location/MockData"
import { faker } from "@faker-js/faker"
import {
  randomBool,
  randomIntegerInRange,
  randomlyUndefined
} from "@lib/utils/Random"

export const mockEventLocation = (): EventLocation => ({
  coordinate: mockLocationCoordinate2D(),
  arrivalRadiusMeters: parseInt(faker.random.numeric(3)),
  isInArrivalTrackingPeriod: randomBool(),
  placemark: randomlyUndefined(mockPlacemark())
})

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
    id: randomIntegerInRange(0, 10000),
    title: "Pickup Basketball",
    description: "I'm better than Lebron James.",
    dateRange: dateRange(
      new Date("2023-03-18T12:00:00"),
      new Date("2023-03-18T13:00:00")
    ),
    color: EventColors.Orange,
    location: mockEventLocation(),
    shouldHideAfterStartDate: false,
    attendeeCount: 10,
    userAttendeeStatus: "attending",
    userMilesFromEvent: 12.7892
  } as CurrentUserEvent

  export const Multiday = {
    host: EventAttendeeMocks.Alivs,
    id: randomIntegerInRange(0, 10000),
    title: "Multiday Event",
    description: "This event runs for more than one day.",
    dateRange: dateRange(
      new Date("2023-03-18T12:00:00"),
      new Date("2023-03-21T12:00:00")
    ),
    color: EventColors.Purple,
    location: mockEventLocation(),
    shouldHideAfterStartDate: false,
    attendeeCount: 3,
    userAttendeeStatus: "attending",
    userMilesFromEvent: 12.7892
  } as CurrentUserEvent

  export const NoPlacemarkInfo = {
    host: EventAttendeeMocks.Alivs,
    id: randomIntegerInRange(0, 10000),
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
    location: { ...mockEventLocation(), placemark: undefined },
    shouldHideAfterStartDate: false,
    userAttendeeStatus: "attending",
    userMilesFromEvent: 12.7892
  } as CurrentUserEvent
}
