import { z } from "zod"
import { TiFAPIFetch } from "./client"
import { UserHandle } from "@content-formatting"

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
}
