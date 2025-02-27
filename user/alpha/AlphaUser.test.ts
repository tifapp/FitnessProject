import { TiFAPI } from "TiFShared/api"
import { mockTiFEndpoint } from "TiFShared/test-helpers/mockAPIServer"
import { AlphaUserStorage, registerAlphaUser } from "./AlphaUser"
import { AlphaUserMocks } from "./MockData"
import { waitFor } from "@testing-library/react-native"

describe("AlphaUser tests", () => {
  describe("RegisterAlphaUser tests", () => {
    it("should create and save the user from the API", async () => {
      const storage = AlphaUserStorage.ephemeral()
      mockTiFEndpoint(
        "createCurrentUserProfile",
        201,
        AlphaUserMocks.TheDarkLord
      )
      const user = await registerAlphaUser(
        AlphaUserMocks.TheDarkLord.name,
        storage,
        TiFAPI.testUnauthenticatedInstance
      )
      const storedUser = await storage.user()
      expect(user).toEqual(AlphaUserMocks.TheDarkLord)
      expect(storedUser).toEqual(user)
    })

    it("should throw an error when response code is 400", async () => {
      mockTiFEndpoint("createCurrentUserProfile", 400, {
        error: "invalid-name"
      })
      expect(
        registerAlphaUser(
          "",
          AlphaUserStorage.ephemeral(),
          TiFAPI.testUnauthenticatedInstance
        )
      ).rejects.toThrow(new Error("invalid name"))
    })
  })

  describe("AlphaUserStorage tests", () => {
    let storage = AlphaUserStorage.ephemeral()
    beforeEach(() => (storage = AlphaUserStorage.ephemeral()))

    it("should not decode any user details when no user set", async () => {
      const user = await storage.user()
      expect(user).toEqual(undefined)
    })

    it("should decode the user details of the set token", async () => {
      await storage.store(AlphaUserMocks.Blob.token)
      expect(await storage.user()).toEqual(AlphaUserMocks.Blob)
    })

    it("should override the user details of the existing user", async () => {
      await storage.store(AlphaUserMocks.Blob.token)
      await storage.store(AlphaUserMocks.TheDarkLord.token)
      expect(await storage.user()).toEqual(AlphaUserMocks.TheDarkLord)
    })

    it("should alert the subscriber whenever the user token changes", async () => {
      const subscriber = jest.fn()
      storage.subscribe(subscriber)
      await storage.store(AlphaUserMocks.Blob.token)
      expect(subscriber).toHaveBeenCalledWith(AlphaUserMocks.Blob)
    })

    it("should load the currently stored user for the initial subscription value", async () => {
      await storage.store(AlphaUserMocks.Blob.token)
      const subscriber = jest.fn()
      storage.subscribe(subscriber)
      await waitFor(() => {
        expect(subscriber).toHaveBeenCalledWith(AlphaUserMocks.Blob)
      })
    })
  })
})
