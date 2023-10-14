import { TestCognitoError } from "@auth/CognitoHelpers"
import { act } from "react-test-renderer"
import { EmailAddress, Password } from ".."
import { fakeTimers } from "../../tests/helpers/Timers"
import { createForgotPasswordEnvironment } from "./Environment"

describe("ForgotPasswordEnvironment tests", () => {
  afterEach(() => act(() => jest.runAllTimers()))
  fakeTimers()
  beforeEach(() => jest.resetAllMocks())
  const cognito = {
    forgotPassword: jest.fn(),
    forgotPasswordSubmit: jest.fn()
  }
  const env = createForgotPasswordEnvironment(cognito)
  test("Forgot Password correctly handles an error", async () => {
    // Test screen to get into actual flow
    cognito.forgotPassword.mockRejectedValueOnce(
      new TestCognitoError("UserNotFoundException")
    )
    const testEmail = "ilikepie1464@gmail.co"

    const result = await env.initiateForgotPassword(
      EmailAddress.parse(testEmail)!
    )

    expect(cognito.forgotPassword).toHaveBeenCalledWith("ilikepie1464@gmail.co")

    expect(result).toEqual("invalid-email")
  })

  test("Forgot Password correctly handles an successful flow", async () => {
    // Test screen to get into actual flow
    const testEmail = "ilikepie1464@gmail.com"

    const result = await env.initiateForgotPassword(
      EmailAddress.parse(testEmail)!
    )

    expect(cognito.forgotPassword).toHaveBeenCalledWith(
      "ilikepie1464@gmail.com"
    )

    expect(result).toEqual("success")
  })

  test("Forgot Password Submit correctly handles an error", async () => {
    // Test screen to get into actual flow
    cognito.forgotPasswordSubmit.mockRejectedValueOnce(
      new TestCognitoError("CodeMismatchException")
    )
    const testEmail = "ilikepie1464@gmail.com"
    const testCode = "123134"
    const testPassword = "fafasfass#$#fafas"

    const result = await env.submitResettedPassword(
      EmailAddress.parse(testEmail)!,
      testCode,
      Password.validate(testPassword)!
    )

    expect(cognito.forgotPasswordSubmit).toHaveBeenCalledWith(
      testEmail,
      testCode,
      testPassword
    )

    expect(result).toEqual("invalid-verification-code")
  })

  test("Forgot Password Submit correctly handles a correct flow", async () => {
    // Test screen to get into actual flow
    const testEmail = "ilikepie1464@gmail.com"
    const testCode = "123134"
    const testPassword = "fafasfass#$#fafas"

    const result = await env.submitResettedPassword(
      EmailAddress.parse(testEmail)!,
      testCode,
      Password.validate(testPassword)!
    )

    expect(cognito.forgotPasswordSubmit).toHaveBeenCalledWith(
      testEmail,
      testCode,
      testPassword
    )

    expect(result).toEqual("valid")
  })
})
