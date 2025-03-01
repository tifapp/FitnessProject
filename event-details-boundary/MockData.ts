import { ClientSideEvent } from "@event/ClientSideEvent"
import { faker } from "@faker-js/faker"

import {
  randomBool,
  randomIntegerInRange,
  randomlyUndefined
} from "@lib/utils/Random"
import { uuidString } from "TiFShared/lib/UUID"
import { mockLocationCoordinate2D, mockPlacemark } from "@location/MockData"

import { ChatTokenRequest } from "TiFShared/api/models/Chat"
import { EventResponse } from "TiFShared/api/models/Event"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { EventAttendee, EventLocation } from "TiFShared/domain-models/Event"
import { dateRange } from "TiFShared/domain-models/FixedDateRange"
import { UserHandle } from "TiFShared/domain-models/User"
import dayjs from "dayjs"

export const mockEventLocation = (): EventLocation => ({
  coordinate: mockLocationCoordinate2D(),
  arrivalRadiusMeters: parseInt(faker.random.numeric(3)),
  isInArrivalTrackingPeriod: randomBool(),
  timezoneIdentifier: faker.address.timeZone(),
  placemark: randomlyUndefined(mockPlacemark())
})

export const mockEventChatTokenRequest = (): ChatTokenRequest => ({
  capability: JSON.stringify({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "5678-event": ["history", "publish", "subscribe"],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "5878-event-pinned": ["history", "subscribe"]
  }),
  clientId: uuidString(),
  keyName: "abcdefghijklmnopqrstuvwxyz123456",
  mac: "abcdefghijklmnopqrstuvwxyz123456",
  timestamp: new Date().getTime(),
  nonce: "1234567890123456"
})

/**
 * Some mock {@link EventAttendee} objects.
 */
export namespace EventAttendeeMocks {
  export const Alivs = {
    id: uuidString(),
    name: "Alvis",
    handle: UserHandle.optionalParse("alvis")!,
    profileImageURL:
      "https://www.escapistmagazine.com/wp-content/uploads/2023/05/xc3-future-redeemed-alvis.jpg?resize=1200%2C673",
    relationStatus: "not-friends",
    joinedDateTime: new Date(1000)
  } as EventAttendee

  export const BlobJr = {
    id: uuidString(),
    name: "Blob Jr.",
    handle: UserHandle.optionalParse("SmallBlob")!,
    relationStatus: "not-friends",
    joinedDateTime: new Date(2000)
  } as EventAttendee

  export const BlobSr = {
    id: uuidString(),
    name: "Blob Sr.",
    handle: UserHandle.optionalParse("OriginalBlob")!,
    relationStatus: "not-friends",
    joinedDateTime: new Date(3000)
  } as EventAttendee

  // NB: Unfortunately, we can't reuse Harrison's legendary
  // Anna Admin and Molly Member personas, bc this isn't a book club...
  // (Also Molly died and was replaced with Haley Host...)

  export const AnnaAttendee = {
    id: uuidString(),
    name: "Anna Attendee",
    handle: UserHandle.optionalParse("AnnaAttendee")!,
    relationStatus: "not-friends",
    joinedDateTime: new Date(4000)
  } as EventAttendee

  export const HaleyHost = {
    id: uuidString(),
    name: "Haley Host",
    handle: UserHandle.optionalParse("HaleyHost")!,
    relationStatus: "not-friends",
    joinedDateTime: new Date(5000)
  } as EventAttendee
}

/**
 * Some mock {@link ClientSideEvent} objects.
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
    joinedDateTime: new Date(),
    isChatExpired: false,
    endedDateTime: undefined
  } as ClientSideEvent

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
    joinedDateTime: new Date(),
    isChatExpired: false,
    endedDateTime: undefined
  } as ClientSideEvent

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
    joinedDateTime: new Date(),
    isChatExpired: false,
    endedDateTime: undefined
  } as ClientSideEvent

  const mockResponseHostId = uuidString()

  export const MockSingleAttendeeResponse = {
    id: 1,
    title: "Some Event",
    color: ColorString.parse("#FFFFFF")!,
    description: "This is an event.",
    hasArrived: false,
    createdDateTime: new Date(2000),
    updatedDateTime: new Date(3000),
    attendeeCount: 10,
    userAttendeeStatus: "attending",
    isChatExpired: false,
    host: {
      id: mockResponseHostId,
      name: "Blob",
      handle: UserHandle.optionalParse("blob")!,
      relationStatus: "not-friends"
    },
    settings: {
      shouldHideAfterStartDate: false,
      isChatEnabled: true
    },
    time: {
      secondsToStart: dayjs.duration(3, "hours").asSeconds(),
      todayOrTomorrow: "today",
      dateRange: dateRange(new Date(), new Date().ext.addSeconds(3600))!
    },
    location: mockEventLocation(),
    previewAttendees: [
      {
        id: mockResponseHostId,
        name: "Blob",
        handle: UserHandle.optionalParse("blob")!,
        relationStatus: "not-friends" as const,
        hasArrived: false,
        joinedDateTime: new Date("2024-03-25T07:56:28.000Z"),
        role: "attending" as const
      }
    ]
  } as EventResponse

  export const MockMultipleAttendeeResponse = {
    id: 2,
    title: "Some Event",
    color: ColorString.parse("#FFFFFF")!,
    description: "This is an event.",
    hasArrived: false,
    createdDateTime: new Date(2000),
    updatedDateTime: new Date(3000),
    attendeeCount: 10,
    userAttendeeStatus: "attending",
    isChatExpired: false,
    host: {
      id: mockResponseHostId,
      name: "Blob",
      handle: UserHandle.optionalParse("blob")!,
      relationStatus: "not-friends"
    },
    settings: {
      shouldHideAfterStartDate: false,
      isChatEnabled: true
    },
    time: {
      secondsToStart: dayjs.duration(3, "hours").asSeconds(),
      todayOrTomorrow: "today",
      dateRange: dateRange(new Date(), new Date().ext.addSeconds(3600))!
    },
    location: mockEventLocation(),
    previewAttendees: [
      {
        id: mockResponseHostId,
        name: "Blob",
        handle: UserHandle.optionalParse("blob")!,
        relationStatus: "not-friends" as const,
        hasArrived: false,
        joinedDateTime: new Date("2024-03-25T07:56:28.000Z"),
        role: "hosting" as const
      },
      {
        id: uuidString(),
        name: "Blob Jr.",
        handle: UserHandle.optionalParse("blob_jr")!,
        relationStatus: "not-friends" as const,
        hasArrived: false,
        joinedDateTime: new Date("2024-03-25T07:58:56.000Z"),
        role: "attending" as const
      }
    ]
  } as EventResponse
}
