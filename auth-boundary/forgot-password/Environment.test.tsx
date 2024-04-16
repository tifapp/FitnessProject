import { TestCognitoError } from "../CognitoHelpers"
import { EmailAddress, Password, USPhoneNumber } from ".."
import { createForgotPasswordEnvironment } from "./Environment"

describe("ForgotPasswordEnvironment tests", () => {
  beforeEach(() => jest.resetAllMocks())

  const cognito = {
    forgotPassword: jest.fn(),
    forgotPasswordSubmit: jest.fn()
  }
  const env = createForgotPasswordEnvironment(cognito)
  test("initiateForgotPassword returns invalid-email when email entered with UserNotFoundException", async () => {
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

  test("initiateForgotPassword returns invalid-phone-number when phone number entered with UserNotFoundException", async () => {
    cognito.forgotPassword.mockRejectedValueOnce(
      new TestCognitoError("UserNotFoundException")
    )
    const result = await env.initiateForgotPassword(USPhoneNumber.mock)
    expect(result).toEqual("invalid-phone-number")
  })

  test("Forgot Password correctly handles an successful flow", async () => {
    const result = await env.initiateForgotPassword(EmailAddress.peacock69)

    expect(cognito.forgotPassword).toHaveBeenCalledWith(
      EmailAddress.peacock69.toString()
    )

    expect(result).toEqual("success")
  })

  test("Forgot Password Submit correctly handles an error", async () => {
    cognito.forgotPasswordSubmit.mockRejectedValueOnce(
      new TestCognitoError("CodeMismatchException")
    )
    const testCode = "123134"
    const testPassword = "fafasfass#$#fafas"

    const result = await env.submitResettedPassword(
      EmailAddress.peacock69,
      testCode,
      Password.validate(testPassword)!
    )

    expect(cognito.forgotPasswordSubmit).toHaveBeenCalledWith(
      EmailAddress.peacock69.toString(),
      testCode,
      testPassword
    )

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

    expect(cognito.forgotPasswordSubmit).toHaveBeenCalledWith(
      EmailAddress.peacock69.toString(),
      testCode,
      testPassword
    )

    expect(result).toEqual("valid")
  })
})
