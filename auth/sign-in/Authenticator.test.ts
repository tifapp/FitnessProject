import { EmailAddress, USPhoneNumber } from ".."
import { CognitoSignInAuthenticator } from "./Authenticator"
import { testAuthErrorWithCode } from "@test-helpers/Cognito"

const CONFIRM_SMS_SIGN_IN_RESULT = {
  isSignedIn: false,
  nextStep: { signInStep: "CONFIRM_SIGN_IN_WITH_SMS_CODE" }
}

describe("CognitoSignInAuthenticator tests", () => {
  beforeEach(() => jest.resetAllMocks())

  const TEST_PASSWORD = "12345678"
  const cognito = {
    signIn: jest.fn(),
    resendSignUpCode: jest.fn(),
    confirmSignIn: jest.fn()
  }
  const authenticator = new CognitoSignInAuthenticator(cognito)

  describe("SignIn tests", () => {
    test("successful sign in with email returns success", async () => {
      cognito.signIn.mockResolvedValueOnce({ isSignedIn: true })
      const result = await authenticator.signIn(
        EmailAddress.peacock69,
        TEST_PASSWORD
      )
      expect(result).toEqual("success")
      expect(cognito.signIn).toHaveBeenCalledWith({
        username: EmailAddress.peacock69.toString(),
        password: TEST_PASSWORD
      })
    })

    test("successful sign in with phone number returns success", async () => {
      cognito.signIn.mockResolvedValueOnce({ isSignedIn: true })
      const result = await authenticator.signIn(
        USPhoneNumber.mock,
        TEST_PASSWORD
      )
      expect(result).toEqual("success")
      expect(cognito.signIn).toHaveBeenCalledWith({
        username: USPhoneNumber.mock.toString(),
        password: TEST_PASSWORD
      })
    })

    test("UserNotFoundException returns incorrect-credentials", async () => {
      cognito.signIn.mockRejectedValueOnce(
        testAuthErrorWithCode("UserNotFoundException")
      )
      const result = await authenticator.signIn(
        USPhoneNumber.mock,
        TEST_PASSWORD
      )
      expect(result).toEqual("incorrect-credentials")
    })

    test("NotAuthorizedException returns incorrect-credentials", async () => {
      cognito.signIn.mockRejectedValueOnce(
        testAuthErrorWithCode("NotAuthorizedException")
      )
      const result = await authenticator.signIn(
        USPhoneNumber.mock,
        TEST_PASSWORD
      )
      expect(result).toEqual("incorrect-credentials")
    })

    test("SMS_MFA challenge on Phone auth returns sign-in-verification-required", async () => {
      cognito.signIn.mockResolvedValueOnce(CONFIRM_SMS_SIGN_IN_RESULT)
      const result = await authenticator.signIn(
        USPhoneNumber.mock,
        TEST_PASSWORD
      )
      expect(result).toEqual("sign-in-verification-required")
    })

    test("UserNotConfirmedException returns sign-up-verification-required and resends the sign-up verification code", async () => {
      cognito.signIn.mockRejectedValueOnce(
        testAuthErrorWithCode("UserNotConfirmedException")
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
      cognito.signIn.mockResolvedValue(CONFIRM_SMS_SIGN_IN_RESULT)
      await authenticator.signIn(EmailAddress.peacock69, TEST_PASSWORD)

      await authenticator.resendSignInVerificationCode()
      expect(cognito.signIn).toHaveBeenNthCalledWith(2, {
        username: EmailAddress.peacock69.toString(),
        password: TEST_PASSWORD
      })
    })
  })

  describe("VerifySignIn tests", () => {
    test("success when entered credentials are correct", async () => {
      cognito.signIn.mockResolvedValueOnce(CONFIRM_SMS_SIGN_IN_RESULT)
      await authenticator.signIn(EmailAddress.peacock69, TEST_PASSWORD)

      cognito.confirmSignIn.mockResolvedValueOnce({ isSignedIn: true })
      const result = await authenticator.verifySignIn("123456")
      expect(result).toEqual("success")
      expect(cognito.confirmSignIn).toHaveBeenCalledWith({
        challengeResponse: "123456"
      })
    })

    test("invalid-verification-code when CodeMismatchException throws", async () => {
      cognito.signIn.mockResolvedValueOnce(CONFIRM_SMS_SIGN_IN_RESULT)
      await authenticator.signIn(EmailAddress.peacock69, TEST_PASSWORD)

      cognito.confirmSignIn.mockRejectedValueOnce(
        testAuthErrorWithCode("CodeMismatchException")
      )
      const result = await authenticator.verifySignIn("123456")
      expect(result).toEqual("invalid-verification-code")
      expect(cognito.confirmSignIn).toHaveBeenCalledWith({
        challengeResponse: "123456"
      })
    })

    test("sign in, resend sign in verification code, verify sign in, uses up-to-date cognito user", async () => {
      cognito.signIn
        .mockResolvedValueOnce(CONFIRM_SMS_SIGN_IN_RESULT)
        .mockResolvedValueOnce({ isSignedIn: true })
      await authenticator.signIn(EmailAddress.peacock69, TEST_PASSWORD)

      await authenticator.resendSignInVerificationCode()

      cognito.confirmSignIn.mockResolvedValueOnce({ isSignedIn: true })
      await authenticator.verifySignIn("123456")
      expect(cognito.confirmSignIn).toHaveBeenCalledWith({
        challengeResponse: "123456"
      })
    })
  })
})
