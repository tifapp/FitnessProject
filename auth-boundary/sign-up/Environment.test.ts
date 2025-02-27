/* eslint-disable @typescript-eslint/naming-convention */
import { TestCognitoError } from "@auth-boundary/CognitoHelpers"
import { uuidString } from "TiFShared/lib/UUID"
import { EmailAddress, USPhoneNumber } from "@user/privacy"
import { TiFAPI } from "TiFShared/api"
import { UserHandle } from "TiFShared/domain-models/User"
import {
  mockTiFEndpoint,
  mockTiFServer
} from "TiFShared/test-helpers/mockAPIServer"
import { Password } from ".."
import { createSignUpEnvironment } from "./Environment"

describe("SignUpEnvironment tests", () => {
  const cognito = {
    signUp: jest.fn(),
    resendSignUp: jest.fn(),
    confirmSignUpWithAutoSignIn: jest.fn()
  }
  const env = createSignUpEnvironment(cognito, TiFAPI.testAuthenticatedInstance)
  beforeEach(() => jest.resetAllMocks())

  describe("CreateAccount tests", () => {
    test("create account with email", async () => {
      const result = await env.createAccount(
        "Bitchell Dickle",
        EmailAddress.parse("peacock69@gmail.com")!,
        Password.validate("12345678")!
      )
      expect(cognito.signUp).toHaveBeenCalledWith({
        username: "peacock69@gmail.com",
        password: "12345678",
        attributes: {
          email: "peacock69@gmail.com",
          name: "Bitchell Dickle"
        },
        autoSignIn: {
          enabled: true
        }
      })
      expect(result).toEqual("success")
    })

    test("create account with phone number", async () => {
      const result = await env.createAccount(
        "Bitchell Dickle",
        USPhoneNumber.parse("1234567890")!,
        Password.validate("12345678")!
      )
      expect(cognito.signUp).toHaveBeenCalledWith({
        username: "+11234567890",
        password: "12345678",
        attributes: {
          phoneNumber: "+11234567890",
          name: "Bitchell Dickle"
        },
        autoSignIn: {
          enabled: true
        }
      })
      expect(result).toEqual("success")
    })

    test("create account with already existing email", async () => {
      cognito.signUp.mockRejectedValueOnce(
        new TestCognitoError("UsernameExistsException")
      )
      const result = await env.createAccount(
        "Bitchell Dickle",
        EmailAddress.parse("peacock69@gmail.com")!,
        Password.validate("12345678")!
      )
      expect(result).toEqual("email-already-exists")
    })

    test("create account with already existing phone number", async () => {
      cognito.signUp.mockRejectedValueOnce(
        new TestCognitoError("UsernameExistsException")
      )
      const result = await env.createAccount(
        "Bitchell Dickle",
        USPhoneNumber.parse("1234567890")!,
        Password.validate("12345678")!
      )
      expect(result).toEqual("phone-number-already-exists")
    })
  })

  describe("CheckIfHandleExists tests", () => {
    test("autocomplete returns user with matching handle, returns true", async () => {
      const handle = UserHandle.parse("abc").handle!

      mockTiFServer({
        autocompleteUsers: {
          expectedRequest: {
            query: {
              limit: "1",
              handle: handle.rawValue
            }
          },
          mockResponse: {
            status: 200,
            data: {
              users: [
                {
                  id: uuidString(),
                  handle,
                  name: "Bitchell Dickle"
                }
              ]
            }
          }
        }
      })

      const doesExist = await env.checkIfUserHandleTaken(handle)
      expect(doesExist).toEqual(true)
    })
  })

  test("autocomplete returns no users, returns false", async () => {
    const handle = UserHandle.parse("abc").handle!

    mockTiFEndpoint("autocompleteUsers", 200, { users: [] })

    const doesExist = await env.checkIfUserHandleTaken(handle)
    expect(doesExist).toEqual(false)
  })

  test("autocomplete returns no user with non-matching handle, returns false", async () => {
    const handle = UserHandle.parse("abc").handle!

    mockTiFEndpoint("autocompleteUsers", 200, {
      users: [
        {
          id: uuidString(),
          handle: UserHandle.optionalParse("thing")!,
          name: "Bitchell Dickle"
        }
      ]
    })

    const doesExist = await env.checkIfUserHandleTaken(handle)
    expect(doesExist).toEqual(false)
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

  describe("FinishRegisteringAccount tests", () => {
    it("should return invalid-verification-code when cognito throws CodeMismatchException", async () => {
      cognito.confirmSignUpWithAutoSignIn.mockRejectedValueOnce(
        new TestCognitoError("CodeMismatchException")
      )
      const result = await env.finishRegisteringAccount(
        USPhoneNumber.parse("1234567890")!,
        "123456"
      )
      expect(result).toEqual("invalid-verification-code")
    })

    it("should forward error when cognito throws a non-CodeMismatchException", async () => {
      cognito.confirmSignUpWithAutoSignIn.mockRejectedValueOnce(new Error())
      const resultPromise = env.finishRegisteringAccount(
        USPhoneNumber.parse("1234567890")!,
        "123456"
      )
      await expect(resultPromise).rejects.toBeInstanceOf(Error)
    })

    it("should return user handle from API when verification code is valid", async () => {
      const handle = UserHandle.parse("test").handle!
      cognito.confirmSignUpWithAutoSignIn.mockResolvedValueOnce("SUCCESS")

      mockTiFEndpoint("createCurrentUserProfile", 201, {
        id: uuidString(),
        name: "Test",
        token: "mock token",
        handle
      })

      const result = await env.finishRegisteringAccount(
        USPhoneNumber.parse("1234567890")!,
        "123456"
      )
      expect(result).toEqual(handle)
    })
  })
})
