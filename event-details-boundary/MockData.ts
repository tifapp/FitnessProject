import { ClientSideEvent } from "@event/ClientSideEvent"
import { faker } from "@faker-js/faker"

import {
  randomBool,
  randomIntegerInRange,
  randomlyUndefined
} from "@lib/utils/Random"
import { mockLocationCoordinate2D, mockPlacemark } from "@location/MockData"
import { uuidString } from "TiFShared/lib/UUID"

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
/**
 * Some mock {@link ClientSideEvent} objects.
 */
export namespace EventMocks {
  // Helper function to create Santa Cruz locations
  function santaCruzLocation(
    name: string = "West Cliff Drive",
    address: string = "West Cliff Drive, Santa Cruz, CA 95060"
  ) {
    return {
      coordinate: {
        latitude: 36.9513 + (Math.random() * 0.03 - 0.015), // Randomize slightly around Santa Cruz
        longitude: -122.0476 + (Math.random() * 0.03 - 0.015)
      },
      arrivalRadiusMeters: 100,
      isInArrivalTrackingPeriod: true,
      timezoneIdentifier: "America/Los_Angeles",
      placemark: {
        name,
        address,
        city: "Santa Cruz",
        state: "CA",
        country: "United States",
        postalCode: "95060"
      }
    }
  }

  export const PickupBasketball = {
    host: EventAttendeeMocks.Alivs,
    id: randomIntegerInRange(1000, 9999),
    title: "Pickup Basketball at UCSC",
    description:
      "Looking for players of all skill levels for a casual pickup game at the UCSC East Field House courts. Bring water and good vibes!",
    color: ColorString.parse("#FF5733"),
    time: {
      dateRange: dateRange(
        new Date("2023-03-18T16:30:00"),
        new Date("2023-03-18T18:00:00")
      ),
      secondsToStart: dayjs.duration(1.5, "hours").asSeconds(),
      todayOrTomorrow: "today",
      clientReceivedTime: new Date()
    },
    settings: {
      shouldHideAfterStartDate: true,
      isChatEnabled: true
    },
    location: santaCruzLocation(
      "UCSC East Field House",
      "1156 High St, Santa Cruz, CA 95064"
    ),
    attendeeCount: 12,
    userAttendeeStatus: "attending",
    hasArrived: false,
    joinedDateTime: new Date(new Date().getTime() - 86400000), // Joined 1 day ago
    isChatExpired: false,
    endedDateTime: undefined
  } as ClientSideEvent

  export const Multiday = {
    host: EventAttendeeMocks.Alivs,
    id: randomIntegerInRange(1000, 9999),
    title: "Santa Cruz Beach Boardwalk Weekend",
    description:
      "Join us for a fun-filled weekend at the Santa Cruz Beach Boardwalk! We'll be riding the Giant Dipper, playing arcade games, and enjoying the beach. Come for any part or the whole weekend!",
    color: ColorString.parse("#3498DB"),
    time: {
      dateRange: dateRange(
        new Date("2023-03-18T10:00:00"),
        new Date("2023-03-20T18:00:00")
      ),
      secondsToStart: dayjs.duration(2, "days").asSeconds(),
      clientReceivedTime: new Date()
    },
    location: santaCruzLocation(
      "Santa Cruz Beach Boardwalk",
      "400 Beach St, Santa Cruz, CA 95060"
    ),
    settings: {
      shouldHideAfterStartDate: false,
      isChatEnabled: true
    },
    attendeeCount: 18,
    userAttendeeStatus: "attending",
    hasArrived: false,
    joinedDateTime: new Date(new Date().getTime() - 259200000), // Joined 3 days ago
    isChatExpired: false,
    endedDateTime: undefined
  } as ClientSideEvent

  export const NoPlacemarkInfo = {
    host: EventAttendeeMocks.Alivs,
    id: randomIntegerInRange(1000, 9999),
    title: "Hidden Surf Spot Meetup",
    attendeeCount: 7,
    description:
      "Meet at these coordinates for a local's-only surf session. Great swells expected! Location details will be shared in the chat. Bring your own board and wetsuit.",
    time: {
      dateRange: dateRange(
        new Date("2023-03-18T06:30:00"),
        new Date("2023-03-18T09:00:00")
      ),
      secondsToStart: dayjs.duration(1, "days").asSeconds(),
      clientReceivedTime: new Date()
    },
    color: ColorString.parse("#2ECC71")!,
    location: {
      coordinate: {
        latitude: 36.9491, // Near Steamer Lane
        longitude: -122.0261
      },
      arrivalRadiusMeters: 100,
      isInArrivalTrackingPeriod: true,
      timezoneIdentifier: "America/Los_Angeles",
      placemark: null
    },
    settings: {
      shouldHideAfterStartDate: false,
      isChatEnabled: true
    },
    userAttendeeStatus: "attending",
    hasArrived: false,
    joinedDateTime: new Date(new Date().getTime() - 43200000), // Joined 12 hours ago
    isChatExpired: false,
    endedDateTime: undefined
  } as ClientSideEvent

  const mockResponseHostId = uuidString()

  export const MockSingleAttendeeResponse = {
    id: 5487,
    title: "Sunset Yoga at Natural Bridges",
    color: ColorString.parse("#9B59B6")!,
    description:
      "Relaxing yoga session at Natural Bridges State Beach. Perfect for all levels. Bring your own mat and a beach towel. We'll finish just in time to watch the sunset!",
    hasArrived: false,
    createdDateTime: new Date(new Date().getTime() - 604800000), // Created 1 week ago
    updatedDateTime: new Date(new Date().getTime() - 86400000), // Updated 1 day ago
    attendeeCount: 15,
    userAttendeeStatus: "attending",
    isChatExpired: false,
    host: {
      id: mockResponseHostId,
      name: "Emma Johnson",
      handle: UserHandle.optionalParse("emmaj")!,
      relationStatus: "not-friends"
    },
    settings: {
      shouldHideAfterStartDate: false,
      isChatEnabled: true
    },
    time: {
      secondsToStart: dayjs.duration(3, "hours").asSeconds(),
      todayOrTomorrow: "today",
      dateRange: dateRange(
        new Date(new Date().getTime() + 10800000), // 3 hours from now
        new Date(new Date().getTime() + 14400000) // 4 hours from now
      )!
    },
    location: santaCruzLocation(
      "Natural Bridges State Beach",
      "2531 W Cliff Dr, Santa Cruz, CA 95060"
    ),
    previewAttendees: [
      {
        id: mockResponseHostId,
        name: "Emma Johnson",
        handle: UserHandle.optionalParse("emmaj")!,
        relationStatus: "not-friends" as const,
        hasArrived: false,
        joinedDateTime: new Date("2024-03-20T15:30:28.000Z"),
        role: "hosting" as const
      }
    ]
  } as EventResponse

  export const MockMultipleAttendeeResponse = {
    id: 6721,
    title: "Downtown Farmers' Market Meetup",
    color: ColorString.parse("#F1C40F")!,
    description:
      "Let's explore the Downtown Farmers' Market together! We'll sample local produce, grab some snacks, and enjoy live music. Meet at the entrance arch on Pacific Avenue.",
    hasArrived: false,
    createdDateTime: new Date(new Date().getTime() - 259200000), // Created 3 days ago
    updatedDateTime: new Date(new Date().getTime() - 43200000), // Updated 12 hours ago
    attendeeCount: 9,
    userAttendeeStatus: "attending",
    isChatExpired: false,
    host: {
      id: mockResponseHostId,
      name: "Miguel Santos",
      handle: UserHandle.optionalParse("msantos")!,
      relationStatus: "not-friends"
    },
    settings: {
      shouldHideAfterStartDate: false,
      isChatEnabled: true
    },
    time: {
      secondsToStart: dayjs.duration(1, "days").asSeconds(),
      todayOrTomorrow: "tomorrow",
      dateRange: dateRange(
        new Date(new Date().getTime() + 86400000), // 1 day from now
        new Date(new Date().getTime() + 93600000) // 1 day + 2 hours from now
      )!
    },
    location: santaCruzLocation(
      "Downtown Farmers' Market",
      "Cedar St & Pacific Ave, Santa Cruz, CA 95060"
    ),
    previewAttendees: [
      {
        id: mockResponseHostId,
        name: "Miguel Santos",
        handle: UserHandle.optionalParse("msantos")!,
        relationStatus: "not-friends" as const,
        hasArrived: false,
        joinedDateTime: new Date("2024-03-24T18:22:13.000Z"),
        role: "hosting" as const
      },
      {
        id: uuidString(),
        name: "Jade Chen",
        handle: UserHandle.optionalParse("jadechen")!,
        relationStatus: "not-friends" as const,
        hasArrived: false,
        joinedDateTime: new Date("2024-03-24T19:08:42.000Z"),
        role: "attending" as const
      },
      {
        id: uuidString(),
        name: "Tyler Williams",
        handle: UserHandle.optionalParse("t_will")!,
        relationStatus: "friends" as const,
        hasArrived: false,
        joinedDateTime: new Date("2024-03-25T09:35:21.000Z"),
        role: "attending" as const
      }
    ]
  } as EventResponse
}
