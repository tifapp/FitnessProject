import { EmailAddress, USPhoneNumber } from ".."
import { createSignUpEnvironment } from "./Environment"

describe("SignUpEnvironment tests", () => {
  const cognito = {
    signUp: jest.fn(),
    resendSignUp: jest.fn()
  }
  const env = createSignUpEnvironment(cognito)

  beforeEach(() => jest.resetAllMocks())

  describe("CreateAccount tests", () => {
    test("create account with email", async () => {
      await env.createAccount(
        "Bitchell Dickle",
        EmailAddress.parse("peacock69@gmail.com")!,
        "1234"
      )
      expect(cognito.signUp).toHaveBeenCalledWith({
        username: "peacock69@gmail.com",
        password: "1234",
        attributes: {
          email: "peacock69@gmail.com",
          name: "Bitchell Dickle"
        },
        autoSignIn: {
          enabled: true
        }
      })
    })

    test("create account with phone number", async () => {
      await env.createAccount(
        "Bitchell Dickle",
        USPhoneNumber.parse("1234567890")!,
        "1234"
      )
      expect(cognito.signUp).toHaveBeenCalledWith({
        username: "+11234567890",
        password: "1234",
        attributes: {
          phoneNumber: "+11234567890",
          name: "Bitchell Dickle"
        },
        autoSignIn: {
          enabled: true
        }
      })
    })
  })

  describe("ResendCode tests", () => {
    test("resend code with email", async () => {
      await env.resendVerificationCode(
        EmailAddress.parse("stupid@protonmail.org")!
      )
      expect(cognito.resendSignUp).toHaveBeenCalledWith("stupid@protonmail.org")
    })

    test("resend code with phone number", async () => {
      await env.resendVerificationCode(USPhoneNumber.parse("(666) 666-6666")!)
      expect(cognito.resendSignUp).toHaveBeenCalledWith("+16666666666")
    })
  })
})
