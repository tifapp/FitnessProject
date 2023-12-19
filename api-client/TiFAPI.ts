import { UserHandle } from "@content-parsing"
import { API_URL } from "@env"
import { z } from "zod"
import { createAWSTiFAPIFetch } from "./aws"
import { TiFAPIFetch, createTiFAPIFetch } from "./client"
import { EventArrivalsOperationResultSchema } from "@shared-models/EventArrivals"
import { LocationCoordinate2D } from "@shared-models/Location"

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

  static testPath (path: `/${string}`) {
    return `${TiFAPI.TEST_URL}${path.slice(1)}`
  }

  static readonly productionInstance = new TiFAPI(
    createAWSTiFAPIFetch(new URL(API_URL))
  )

  static readonly testAuthenticatedInstance = new TiFAPI(
    createTiFAPIFetch(TiFAPI.TEST_URL, async () => "test jwt")
  )

  private readonly apiFetch: TiFAPIFetch

  constructor (apiFetch: TiFAPIFetch) {
    this.apiFetch = apiFetch
  }

  /**
   * Creates the user's TiF profile after they have fully signed up and verified their account.
   *
   * @returns an object containing the user's id and generated user handle.
   */
  async createCurrentUserProfile () {
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
  async updateCurrentUserProfile (request: UpdateCurrentUserProfileRequest) {
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
  async autocompleteUsers (handle: string, limit: number, signal?: AbortSignal) {
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
   * Indicates that the user has arrived at the given upcoming (less than 24 hours from start time)
   * events at the given coordinate.
   *
   * @param coordinate the coordinate shared by all the events.
   * @param eventIds a list of event ids to mark as arrived.
   * @returns an object containing an array of {@link EventArrivalsOperationResult}s
   */
  async arriveAtEvents (eventIds: number[], coordinate: LocationCoordinate2D) {
    return await this.apiFetch(
      {
        method: "POST",
        endpoint: "/events/arrived",
        body: { location: coordinate, events: eventIds }
      },
      {
        status200: z.object({
          arrivalStatuses: z.array(EventArrivalsOperationResultSchema)
        })
      }
    )
  }

  /**
   * Indicates that the user has departer from the given upcoming (less than 24 hours from start time)
   * events at the given coordinate.
   *
   * @param coordinate the coordinate shared by all the events.
   * @param eventIds a list of event ids to mark as departed.
   * @returns an object containing an array of {@link EventArrivalsOperationResult}s
   */
  async departFromEvents (eventIds: number[], coordinate: LocationCoordinate2D) {
    return await this.apiFetch(
      {
        method: "POST",
        endpoint: "/events/departed",
        body: { location: coordinate, events: eventIds }
      },
      {
        status200: z.object({
          arrivalStatuses: z.array(EventArrivalsOperationResultSchema)
        })
      }
    )
  }
}
