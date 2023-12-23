import { simpleAuthError } from "@auth/CognitoHelpers"
import { EmailAddress, USPhoneNumber } from ".."
import { CognitoSignInAuthenticator } from "./Authenticator"

describe("CognitoSignInAuthenticator tests", () => {
  beforeEach(() => jest.resetAllMocks())

  const TEST_PASSWORD = "12345678"
  const cognito = {
    signIn: jest.fn(),
    resendSignUp: jest.fn(),
    confirmSignIn: jest.fn()
  }
  const authenticator = new CognitoSignInAuthenticator(cognito)

  describe("SignIn tests", () => {
    test("successful sign in with email returns success", async () => {
      cognito.signIn.mockReturnValueOnce(Promise.resolve())
      const result = await authenticator.signIn(
        EmailAddress.peacock69,
        TEST_PASSWORD
      )
      expect(result).toEqual("success")
      expect(cognito.signIn).toHaveBeenCalledWith(
        EmailAddress.peacock69.toString(),
        TEST_PASSWORD
      )
    })

    test("successful sign in with phone number returns success", async () => {
      cognito.signIn.mockReturnValueOnce(Promise.resolve({}))
      const result = await authenticator.signIn(
        USPhoneNumber.mock,
        TEST_PASSWORD
      )
      expect(result).toEqual("success")
    })

    test("UserNotFoundException returns incorrect-credentials", async () => {
      cognito.signIn.mockRejectedValueOnce(
        simpleAuthError("UserNotFoundException")
      )
      const result = await authenticator.signIn(
        USPhoneNumber.mock,
        TEST_PASSWORD
      )
      expect(result).toEqual("incorrect-credentials")
    })

    test("NotAuthorizedException returns incorrect-credentials", async () => {
      cognito.signIn.mockRejectedValueOnce(
        simpleAuthError("NotAuthorizedException")
      )
      const result = await authenticator.signIn(
        USPhoneNumber.mock,
        TEST_PASSWORD
      )
      expect(result).toEqual("incorrect-credentials")
    })

    test("SMS_MFA challenge on Phone auth returns sign-in-verification-required", async () => {
      cognito.signIn.mockResolvedValueOnce({ challengeName: "SMS_MFA" })
      const result = await authenticator.signIn(
        USPhoneNumber.mock,
        TEST_PASSWORD
      )
      expect(result).toEqual("sign-in-verification-required")
    })

    test("UserNotConfirmedException returns sign-up-verification-required and resends the sign-up verification code", async () => {
      cognito.signIn.mockRejectedValueOnce(
        simpleAuthError("UserNotConfirmedException")
      )
      const result = await authenticator.signIn(
        USPhoneNumber.mock,
        TEST_PASSWORD
      )
      expect(result).toEqual("sign-up-verification-required")
    })
  })

  describe("ResendSignInVerificationCode tests", () => {
    test("resent verification code after sign in verifcation required", async () => {
      cognito.signIn.mockResolvedValue({ challengeName: "SMS_MFA" })
      await authenticator.signIn(EmailAddress.peacock69, TEST_PASSWORD)

      await authenticator.resendSignInVerificationCode()
      expect(cognito.signIn).toHaveBeenNthCalledWith(
        2,
        EmailAddress.peacock69.toString(),
        TEST_PASSWORD
      )
    })
  })

  describe("VerifySignIn tests", () => {
    test("success when entered credentials are correct", async () => {
      const signedInUser = { challengeName: "SMS_MFA" }
      cognito.signIn.mockResolvedValueOnce(signedInUser)
      await authenticator.signIn(EmailAddress.peacock69, TEST_PASSWORD)

      cognito.confirmSignIn.mockResolvedValueOnce({})
      const result = await authenticator.verifySignIn("123456")
      expect(result).toEqual("success")
      expect(cognito.confirmSignIn).toHaveBeenCalledWith(
        signedInUser,
        "123456",
        "SMS_MFA"
      )
    })

    test("invalid-verification-code when CodeMismatchException throws", async () => {
      const signedInUser = { challengeName: "SMS_MFA" }
      cognito.signIn.mockResolvedValueOnce(signedInUser)
      await authenticator.signIn(EmailAddress.peacock69, TEST_PASSWORD)

      cognito.confirmSignIn.mockRejectedValueOnce(
        simpleAuthError("CodeMismatchException")
      )
      const result = await authenticator.verifySignIn("123456")
      expect(result).toEqual("invalid-verification-code")
      expect(cognito.confirmSignIn).toHaveBeenCalledWith(
        signedInUser,
        "123456",
        "SMS_MFA"
      )
    })

    test("sign in, resend sign in verification code, verify sign in, uses up-to-date cognito user", async () => {
      const upToDateCognitoUser = {
        challengeName: "SMS_MFA",
        attribute: "thing"
      }
      cognito.signIn
        .mockResolvedValueOnce({ challengeName: "SMS_MFA" })
        .mockResolvedValueOnce(upToDateCognitoUser)
      await authenticator.signIn(EmailAddress.peacock69, TEST_PASSWORD)

      await authenticator.resendSignInVerificationCode()

      cognito.confirmSignIn.mockReturnValueOnce(Promise.resolve({}))
      await authenticator.verifySignIn("123456")
      expect(cognito.confirmSignIn).toHaveBeenCalledWith(
        upToDateCognitoUser,
        "123456",
        "SMS_MFA"
      )
    })
  })
})
