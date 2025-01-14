import {
  CognitoAccessToken,
  CognitoUserSession,
  CognitoIdToken
} from "amazon-cognito-identity-js"
import { bearerToken } from "./TiFAPI"
import { AlphaUserStorage } from "@user/alpha"
import { AlphaUserMocks } from "@user/alpha/MockData"

describe("TiFAPI tests", () => {
  describe("BearerToken tests", () => {
    const TEST_USER_TOKEN = "I was here at the beginning"
    const TEST_COGNITO_USER_TOKEN = "And I will proclaim the end"

    let storage = AlphaUserStorage.ephemeral()
    beforeEach(() => (storage = AlphaUserStorage.ephemeral()))

    const TEST_COGNITO_USER_SESSION = new CognitoUserSession({
      AccessToken: new CognitoAccessToken({
        AccessToken: TEST_COGNITO_USER_TOKEN
      }),
      IdToken: new CognitoIdToken({ IdToken: TEST_COGNITO_USER_TOKEN })
    })

    it("should use the launch argument token over the AWS token", async () => {
      const token = await bearerToken(
        {
          testCognitoUserToken: new CognitoAccessToken({
            AccessToken: TEST_USER_TOKEN
          })
        },
        storage,
        jest.fn().mockResolvedValueOnce(TEST_COGNITO_USER_SESSION)
      )
      expect(token).toEqual(TEST_USER_TOKEN)
    })

    it("should use the token from the current cognito session", async () => {
      const token = await bearerToken(
        {},
        storage,
        jest.fn().mockResolvedValueOnce(TEST_COGNITO_USER_SESSION)
      )
      expect(token).toEqual(TEST_COGNITO_USER_TOKEN)
    })

    it("should use the token from the alpha user storage if provided", async () => {
      await storage.store(AlphaUserMocks.TheDarkLord.token)
      const token = await bearerToken(
        {},
        storage,
        jest.fn().mockResolvedValueOnce(TEST_COGNITO_USER_SESSION)
      )
      expect(token).toEqual(AlphaUserMocks.TheDarkLord.token)
    })

    it("should return undefined loading the current session throws and no test token provided", async () => {
      const token = await bearerToken(
        {},
        storage,
        jest.fn().mockRejectedValueOnce(new Error("No Session"))
      )
      expect(token).toBeUndefined()
    })
  })
})
