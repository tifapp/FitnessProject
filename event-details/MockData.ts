import { UserHandle } from "@content-parsing"
import { uuidString } from "@lib/utils/UUID"
import {
  CurrentUserEvent,
  EventAttendee,
  EventLocation
} from "@shared-models/Event"
import { dateRange, dayjs } from "@date-time"
import { mockLocationCoordinate2D, mockPlacemark } from "@location/MockData"
import { faker } from "@faker-js/faker"
import {
  randomBool,
  randomIntegerInRange,
  randomlyNull
} from "@lib/utils/Random"
import { ColorString } from "@lib/utils/Color"

export const mockEventLocation = (): EventLocation => ({
  coordinate: mockLocationCoordinate2D(),
  arrivalRadiusMeters: parseInt(faker.random.numeric(3)),
  isInArrivalTrackingPeriod: randomBool(),
  timezoneIdentifier: faker.address.timeZone(),
  placemark: randomlyNull(mockPlacemark())
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
      "https://www.escapistmagazine.com/wp-content/uploads/2023/05/xc3-future-redeemed-alvis.jpg?resize=1200%2C673",
    relations: {
      themToYou: "not-friends",
      youToThem: "not-friends"
    }
  } as EventAttendee

  export const BlobJr = {
    id: uuidString(),
    username: "Blob Jr.",
    handle: UserHandle.optionalParse("SmallBlob")!,
    profileImageURL: null,
    relations: {
      themToYou: "not-friends",
      youToThem: "not-friends"
    }
  } as EventAttendee

  export const BlobSr = {
    id: uuidString(),
    username: "Blob Sr.",
    handle: UserHandle.optionalParse("OriginalBlob")!,
    profileImageURL: null,
    relations: {
      themToYou: "not-friends",
      youToThem: "not-friends"
    }
  } as EventAttendee

  // NB: Unfortunately, we can't reuse Harrison's legendary
  // Anna Admin and Molly Member personas, bc this isn't a book club...
  // (Also Molly died and was replaced with Haley Host...)

  export const AnnaAttendee = {
    id: uuidString(),
    username: "Anna Attendee",
    handle: UserHandle.optionalParse("AnnaAttendee")!,
    profileImageURL: null,
    relations: {
      themToYou: "not-friends",
      youToThem: "not-friends"
    }
  } as EventAttendee

  export const HaleyHost = {
    id: uuidString(),
    username: "Haley Host",
    handle: UserHandle.optionalParse("HaleyHost")!,
    profileImageURL: null,
    relations: {
      themToYou: "not-friends",
      youToThem: "not-friends"
    }
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
    color: ColorString.parse("#ABCDEF"),
    time: {
      dateRange: dateRange(
        new Date("2023-03-18T12:00:00"),
        new Date("2023-03-18T13:00:00")
      ),
      secondsToStart: dayjs.duration(3, "hours").asSeconds(),
      todayOrTomorrow: "today",
      clientReceivedTime: new Date()
    },
    settings: {
      shouldHideAfterStartDate: true,
      isChatEnabled: true
    },
    location: mockEventLocation(),
    attendeeCount: 10,
    userAttendeeStatus: "attending",
    hasArrived: false,
    joinDate: new Date(),
    isChatExpired: false,
    hasEndedEarly: false
  } as CurrentUserEvent

  export const Multiday = {
    host: EventAttendeeMocks.Alivs,
    id: randomIntegerInRange(0, 10000),
    title: "Multiday Event",
    description: "This event runs for more than one day.",
    color: ColorString.parse("#ABCDEF"),
    time: {
      dateRange: dateRange(
        new Date("2023-03-18T12:00:00"),
        new Date("2023-03-21T12:00:00")
      ),
      secondsToStart: dayjs.duration(2, "days").asSeconds(),
      clientReceivedTime: new Date()
    },
    location: mockEventLocation(),
    settings: {
      shouldHideAfterStartDate: false,
      isChatEnabled: true
    },
    attendeeCount: 3,
    userAttendeeStatus: "attending",
    hasArrived: false,
    joinDate: new Date(),
    isChatExpired: false,
    hasEndedEarly: false
  } as CurrentUserEvent

  export const NoPlacemarkInfo = {
    host: EventAttendeeMocks.Alivs,
    id: randomIntegerInRange(0, 10000),
    title: "No Placemark Info",
    attendeeCount: 5,
    description:
      "The placemark info should then be geocoded from the coordinates if it is not available.",
    time: {
      dateRange: dateRange(
        new Date("2023-03-18T12:00:00"),
        new Date("2023-03-18T15:00:00")
      ),
      secondsToStart: dayjs.duration(2, "days").asSeconds(),
      clientReceivedTime: new Date()
    },
    color: ColorString.parse("#ABCDEF")!,
    location: { ...mockEventLocation(), placemark: null },
    settings: {
      shouldHideAfterStartDate: false,
      isChatEnabled: true
    },
    userAttendeeStatus: "attending",
    hasArrived: false,
    joinDate: new Date(),
    isChatExpired: false,
    hasEndedEarly: false
  } as CurrentUserEvent
}
