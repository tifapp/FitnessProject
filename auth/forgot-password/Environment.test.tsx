import { TestCognitoError } from "@auth/CognitoHelpers"
import { act } from "react-test-renderer"
import { EmailAddress, Password, USPhoneNumber } from ".."
import { fakeTimers } from "../../tests/helpers/Timers"
import { createForgotPasswordEnvironment } from "./Environment"

describe("ForgotPasswordEnvironment tests", () => {
  afterEach(() => act(() => jest.runAllTimers()))
  fakeTimers()
  beforeEach(() => jest.resetAllMocks())
  const cognito = {
    resetPassword: jest.fn(),
    confirmResetPassword: jest.fn()
  }
  const env = createForgotPasswordEnvironment(cognito)
  test("initiateForgotPassword returns invalid-email when email entered with UserNotFoundException", async () => {
    // Test screen to get into actual flow
    cognito.resetPassword.mockRejectedValueOnce(
      new TestCognitoError("UserNotFoundException")
    )
    const testEmail = "ilikepie1464@gmail.co"

    const result = await env.initiateForgotPassword(
      EmailAddress.parse(testEmail)!
    )

    expect(cognito.resetPassword).toHaveBeenCalledWith({
      username: "ilikepie1464@gmail.co"
    })

    expect(result).toEqual("invalid-email")
  })

  test("initiateForgotPassword returns invalid-phone-number when phone number entered with UserNotFoundException", async () => {
    cognito.resetPassword.mockRejectedValueOnce(
      new TestCognitoError("UserNotFoundException")
    )
    const result = await env.initiateForgotPassword(USPhoneNumber.mock)
    expect(result).toEqual("invalid-phone-number")
  })

  test("Forgot Password correctly handles an successful flow", async () => {
    const result = await env.initiateForgotPassword(EmailAddress.peacock69)

    expect(cognito.resetPassword).toHaveBeenCalledWith({
      username: EmailAddress.peacock69.toString()
    })

    expect(result).toEqual("success")
  })

  test("Forgot Password Submit correctly handles an error", async () => {
    cognito.confirmResetPassword.mockRejectedValueOnce(
      new TestCognitoError("CodeMismatchException")
    )
    const testCode = "123134"
    const testPassword = "fafasfass#$#fafas"

    const result = await env.submitResettedPassword(
      EmailAddress.peacock69,
      testCode,
      Password.validate(testPassword)!
    )

    expect(cognito.confirmResetPassword).toHaveBeenCalledWith({
      username: EmailAddress.peacock69.toString(),
      confirmationCode: testCode,
      newPassword: testPassword
    })

    expect(result).toEqual("invalid-verification-code")
  })

  test("Forgot Password Submit correctly handles a correct flow", async () => {
    const testCode = "123134"
    const testPassword = "fafasfass#$#fafas"

    const result = await env.submitResettedPassword(
      EmailAddress.peacock69,
      testCode,
      Password.validate(testPassword)!
    )

    expect(cognito.confirmResetPassword).toHaveBeenCalledWith({
      username: EmailAddress.peacock69.toString(),
      confirmationCode: testCode,
      newPassword: testPassword
    })

    expect(result).toEqual("valid")
  })
})
