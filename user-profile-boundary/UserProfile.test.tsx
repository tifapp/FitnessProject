import { EventAttendeeMocks } from "@event-details-boundary/MockData"
import { AlphaUserStorage } from "@user/alpha"
import { AlphaUserMocks } from "@user/alpha/MockData"
import { TiFAPI } from "TiFShared/api"
import { UserProfile } from "TiFShared/domain-models/User"
import { mockTiFEndpoint } from "TiFShared/test-helpers/mockAPIServer"
import { userProfile } from "./Context"

describe("UserProfile tests", () => {
  const testUser = {
    id: EventAttendeeMocks.Alivs.id,
    name: EventAttendeeMocks.Alivs.name,
    handle: EventAttendeeMocks.Alivs.handle,
    relationStatus: "not-friends" as const,
    createdDateTime: new Date(Date.now() + 100000),
    updatedDateTime: new Date(Date.now() + 100000)
  }
  describe("fetchUserProfile tests", () => {
    it("loads user data successfully", async () => {
      mockTiFEndpoint("getUser", 200, testUser as UserProfile)
      const user = await userProfile(
        EventAttendeeMocks.Alivs.id,
        TiFAPI.testUnauthenticatedInstance,
        AlphaUserStorage.ephemeral()
      )
      expect(user).toEqual({ status: "success", user: testUser })
    })
    it("gives an error if error code is 403", async () => {
      const testUser = {
        userId: EventAttendeeMocks.Alivs.id,
        error: "blocked-you" as const
      }
      mockTiFEndpoint("getUser", 403, testUser)
      const user = await userProfile(
        EventAttendeeMocks.Alivs.id,
        TiFAPI.testUnauthenticatedInstance,
        AlphaUserStorage.ephemeral()
      )
      expect(user.status).toEqual("blocked-you")
    })
    it("doesn't try to use storage when userID is not stored user", async () => {
      const storage = AlphaUserStorage.ephemeral()
      await storage.store(AlphaUserMocks.TheDarkLord.token)
      mockTiFEndpoint("getUser", 200, testUser as UserProfile)
      const user = await userProfile(
        testUser.id,
        TiFAPI.testUnauthenticatedInstance,
        storage
      )
      expect(user).toEqual({
        status: "success",
        user: testUser
      })
    })
    it("loads from storage instead of api when current user", async () => {
      const storage = AlphaUserStorage.ephemeral()
      await storage.store(AlphaUserMocks.TheDarkLord.token)
      const user = await userProfile(
        AlphaUserMocks.TheDarkLord.id,
        TiFAPI.testUnauthenticatedInstance,
        storage
      )
      expect(user).toEqual({
        status: "success",
        user: { ...AlphaUserMocks.TheDarkLord, relationStatus: "current-user" }
      })
    })
  })
})
