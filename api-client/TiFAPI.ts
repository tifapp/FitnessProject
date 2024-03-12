import { UserHandle } from "@content-parsing"
import { API_URL } from "@env"
import {
  BlockedEventResponseSchema,
  CurrentUserEventResponseSchema,
  EventAttendeesPageSchema,
  EventRegion
} from "@shared-models/Event"
import { UpcomingEventArrivalsRegionsSchema } from "@shared-models/EventArrivals"
import { z } from "zod"
import { createAWSTiFAPIFetch } from "./aws"
import { TiFAPIFetch, createTiFAPIFetch } from "./client"
import { JoinEventResponseSchema } from "@shared-models/JoinEvent"
import { UserID } from "@shared-models/User"

export type UpdateCurrentUserProfileRequest = Partial<{
  name: string
  bio: string
  handle: UserHandle
}>

/**
 * A high-level client for the TiF API.
 *
 * This class provides wrapper functions which use the lower level {@link TiFAPIFetch}
 * function. The lower level function automatically tracks the current user's session
 * and handles authorization headers as well as response parsing.
 */
export class TiFAPI {
  static readonly TEST_URL = new URL("https://localhost:8080")

  static testPath(path: `/${string}`) {
    return `${TiFAPI.TEST_URL}${path.slice(1)}`
  }

  static readonly productionInstance = new TiFAPI(
    createAWSTiFAPIFetch(new URL(API_URL))
  )

  static readonly testAuthenticatedInstance = new TiFAPI(
    createTiFAPIFetch(TiFAPI.TEST_URL, async () => "test jwt")
  )

  private readonly apiFetch: TiFAPIFetch

  constructor(apiFetch: TiFAPIFetch) {
    this.apiFetch = apiFetch
  }

  /**
   * Creates the user's TiF profile after they have fully signed up and verified their account.
   *
   * @returns an object containing the user's id and generated user handle.
   */
  async createCurrentUserProfile() {
    return await this.apiFetch(
      { method: "POST", endpoint: "/user" },
      {
        status201: z.object({
          id: z.string().uuid(),
          handle: UserHandle.zodSchema
        })
      }
    )
  }

  /**
   * Updates the current user's profile attributes.
   */
  async updateCurrentUserProfile(request: UpdateCurrentUserProfileRequest) {
    return await this.apiFetch(
      {
        method: "PATCH",
        endpoint: "/user/self",
        body: request
      },
      {
        status204: "no-content"
      }
    )
  }

  /**
   * Given a partial handle, returns a list of autocompleted users with a similar handle.
   *
   * @param handle a handle string.
   * @param limit the maximum amount of users to return.
   * @param signal an {@link AbortSignal} to cancel the query.
   * @returns an object with a list of users containing their name, handle, and id.
   */
  async autocompleteUsers(handle: string, limit: number, signal?: AbortSignal) {
    return await this.apiFetch(
      {
        method: "GET",
        endpoint: "/user/autocomplete",
        query: { handle, limit }
      },
      {
        status200: z.object({
          users: z.array(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              handle: UserHandle.zodSchema
            })
          )
        })
      },
      signal
    )
  }

  /**
   * Indicates that the user has arrived at the given region.
   *
   * @returns a list of regions of the user's upcoming events.
   */
  async arriveAtRegion(region: EventRegion) {
    return await this.apiFetch(
      {
        method: "POST",
        endpoint: "/event/arrived",
        body: region
      },
      {
        status200: UpcomingEventArrivalsRegionsSchema
      }
    )
  }

  /**
   * Indicates that the user has departed from the given region.
   *
   * @returns a list of regions of the user's upcoming events.
   */
  async departFromRegion(region: EventRegion) {
    return await this.apiFetch(
      {
        method: "POST",
        endpoint: "/event/departed",
        body: region
      },
      {
        status200: UpcomingEventArrivalsRegionsSchema
      }
    )
  }

  /**
   * Fetches all upcoming event arrival regions.
   *
   * The regions include ids of events that are either ongoing, or
   * start within the next 24 hours.
   *
   * @returns a list of regions of the user's upcoming events.
   */
  async upcomingEventArrivalRegions() {
    return await this.apiFetch(
      {
        method: "GET",
        endpoint: "/event/upcoming"
      },
      { status200: UpcomingEventArrivalsRegionsSchema }
    )
  }

  /**
   * Loads an individual event by its id.
   */
  async eventDetails(eventId: number) {
    return await this.apiFetch(
      {
        method: "GET",
        endpoint: `/event/details/${eventId}`
      },
      {
        status200: CurrentUserEventResponseSchema.refine(
          (resp) => resp.id === eventId
        ),
        status204: "no-content",
        status404: EventNotFoundErrorSchema,
        status403: BlockedEventResponseSchema.refine(
          (resp) => resp.id === eventId
        )
      }
    )
  }

  async attendeesList(eventId: number, limit: number, nextPage?: string) {
    return await this.apiFetch(
      {
        method: "GET",
        endpoint: `/event/attendees/${eventId}`,
        query: { limit, nextPage }
      },
      {
        status200: EventAttendeesPageSchema,
        status204: "no-content",
        status404: EventNotFoundErrorSchema,
        status403: literalErrorSchema("blocked-by-host")
      }
    )
  }

  /**
   * Joins the event with the given id.
   *
   * @param eventId The id of the event to join.
   * @param arrivalRegion A region to pass for marking an initial arrival if the user has arrived in the area of the event.
   * @returns The upcoming event arrivals based on the user joining this event, and a token request for the event group chat.
   */
  async joinEvent(eventId: number, arrivalRegion: EventRegion | null) {
    const body = arrivalRegion ? { region: arrivalRegion } : undefined
    return await this.apiFetch(
      {
        method: "POST",
        endpoint: `/event/join/${eventId}`,
        body
      },
      {
        status403: literalErrorSchema(
          "event-has-ended",
          "event-was-cancelled",
          "user-is-blocked"
        ),
        status201: JoinEventResponseSchema.refine(
          (resp) => resp.id === eventId
        ),
        status200: JoinEventResponseSchema.refine((resp) => resp.id === eventId)
      }
    )
  }

  /**
   * Leaves the event with the given id.
   *
   * @param eventId The id of the event to leave.
   */
  async leaveEvent(eventId: number) {
    return await this.apiFetch(
      {
        method: "POST",
        endpoint: `/event/leave/${eventId}`
      },
      {
        status403: literalErrorSchema(
          "event-has-been-cancelled",
          "event-has-ended"
        ),
        status400: literalErrorSchema(
          "co-host-not-found",
          "already-left-event"
        ),
        status204: "no-content"
      }
    )
  }

  /**
   * Registers for the user for push notifications given a push token and a
   * platform name.
   */
  async registerForPushNotifications(
    pushToken: string,
    platformName: "apple" | "android"
  ) {
    return await this.apiFetch(
      {
        method: "POST",
        endpoint: "/user/notifications/push/register",
        body: { pushToken, platformName }
      },
      {
        status201: z.object({ status: z.literal("inserted") }),
        status400: literalErrorSchema("token-already-registered")
      }
    )
  }

  /**
   * Blocks a user.
   *
   * Blocks can be mutual (ie. 2 users can block each other regardless of if
   * they have been blocked by the user they are trying to block), so this
   * endpoint only fails if the given user id does not exist.
   */
  async blockUser(id: UserID) {
    return await this.apiFetch(
      {
        method: "PATCH",
        endpoint: `/user/block/${id}`
      },
      {
        status204: "no-content",
        status404: UserNotFoundResponseSchema
      }
    )
  }

  /**
   * Unblocks a user.
   *
   * Blocks can be mutual (ie. 2 users can block each other regardless of if
   * they have been blocked by the user they are trying to block), so this
   * endpoint only fails if the given user id does not exist or if the user
   * is not blocked in the first place.
   */
  async unblockUser(id: UserID) {
    return await this.apiFetch(
      {
        method: "DELETE",
        endpoint: `/user/block/${id}`
      },
      {
        status204: "no-content",
        status404: UserNotFoundResponseSchema,
        status403: userErrorSchema("user-not-blocked")
      }
    )
  }
}

const literalErrorSchema = <T extends z.Primitive, V extends z.Primitive[]>(
  literal: T,
  ...literals: [...V]
) => {
  if (literals.length === 0) return z.object({ error: z.literal(literal) })
  const [literal2, ...rest] = literals.map((l) => z.literal(l))
  return z.object({ error: z.union([z.literal(literal), literal2, ...rest]) })
}

const EventNotFoundErrorSchema = literalErrorSchema("event-not-found")

const userErrorSchema = <T extends z.Primitive>(literal: T) => {
  return literalErrorSchema(literal).extend({
    userId: z.string().uuid()
  })
}

const UserNotFoundResponseSchema = userErrorSchema("user-not-found")
