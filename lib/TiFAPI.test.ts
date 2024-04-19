import {
  CognitoAccessToken,
  CognitoUserSession,
  CognitoIdToken
} from "amazon-cognito-identity-js"
import { cognitoBearerToken } from "./TiFAPI"

describe("TiFAPI tests", () => {
  describe("CognitoBearerToken tests", () => {
    const TEST_USER_TOKEN = "I was here at the beginning"
    const TEST_COGNITO_USER_TOKEN = "And I will proclaim the end"

    const TEST_COGNITO_USER_SESSION = new CognitoUserSession({
      AccessToken: new CognitoAccessToken({
        AccessToken: TEST_COGNITO_USER_TOKEN
      }),
      IdToken: new CognitoIdToken({ IdToken: TEST_COGNITO_USER_TOKEN })
    })

    it("should use the launch argument token over the AWS token", async () => {
      const token = await cognitoBearerToken(
        {
          testCognitoUserToken: new CognitoAccessToken({
            AccessToken: TEST_USER_TOKEN
          })
        },
        jest.fn().mockResolvedValueOnce(TEST_COGNITO_USER_SESSION)
      )
      expect(token).toEqual(TEST_USER_TOKEN)
    })

    it("should use the token from the current cognito session", async () => {
      const token = await cognitoBearerToken(
        {},
        jest.fn().mockResolvedValueOnce(TEST_COGNITO_USER_SESSION)
      )
      expect(token).toEqual(TEST_COGNITO_USER_TOKEN)
    })

    it("should return undefined loading the current session throws and no test token provided", async () => {
      const token = await cognitoBearerToken(
        {},
        jest.fn().mockRejectedValueOnce(new Error("No Session"))
      )
      expect(token).toBeUndefined()
    })
  })
})
