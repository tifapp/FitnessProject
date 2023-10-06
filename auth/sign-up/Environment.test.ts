import { EmailAddress, USPhoneNumber } from ".."
import { createSignUpEnvironment } from "./Environment"
import { TiFAPI } from "@api-client/TiFAPI"
import { createTiFAPIFetch } from "@api-client/client"
import { rest } from "msw"
import { UserHandle } from "@lib/users"
import { uuid } from "@lib/uuid"
import { COGNITO_CODE_MISMATCH_EXCEPTION_ERROR_CODE } from "@auth/CognitoHelpers"
import { mswServer } from "../../tests/helpers/msw"

describe("SignUpEnvironment tests", () => {
  const cognito = {
    signUp: jest.fn(),
    resendSignUp: jest.fn(),
    confirmSignUp: jest.fn()
  }
  const env = createSignUpEnvironment(
    cognito,
    new TiFAPI(
      createTiFAPIFetch(
        new URL("https://localhost:8080"),
        async () => "I am a jwt"
      )
    )
  )
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

  describe("CheckIfHandleExists tests", () => {
    test("autocomplete returns user with matching handle, returns true", async () => {
      const handle = UserHandle.parse("abc").handle!
      mswServer.use(
        rest.get(
          "https://localhost:8080/user/autocomplete",
          async (req, res, ctx) => {
            if (req.url.searchParams.get("limit") !== "1") {
              return res(ctx.status(500))
            }
            if (req.url.searchParams.get("handle") !== handle.rawValue) {
              return res(ctx.status(500))
            }
            return res(
              ctx.status(200),
              ctx.json({
                users: [
                  {
                    id: uuid(),
                    handle: handle.rawValue,
                    name: "Bitchell Dickle"
                  }
                ]
              })
            )
          }
        )
      )

      const doesExist = await env.checkIfUserHandleTaken(handle)
      expect(doesExist).toEqual(true)
    })
  })

  test("autocomplete returns no users, returns false", async () => {
    const handle = UserHandle.parse("abc").handle!
    mswServer.use(
      rest.get(
        "https://localhost:8080/user/autocomplete",
        async (_, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              users: []
            })
          )
        }
      )
    )

    const doesExist = await env.checkIfUserHandleTaken(handle)
    expect(doesExist).toEqual(false)
  })

  test("autocomplete returns no user with non-matching handle, returns false", async () => {
    const handle = UserHandle.parse("abc").handle!
    mswServer.use(
      rest.get(
        "https://localhost:8080/user/autocomplete",
        async (_, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              users: [
                {
                  id: uuid(),
                  handle: "thing",
                  name: "Bitchell Dickle"
                }
              ]
            })
          )
        }
      )
    )

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
    class CodeError extends Error {
      code = COGNITO_CODE_MISMATCH_EXCEPTION_ERROR_CODE
    }

    it("should return \"invalid-verification-code\" when cognito throws CodeMismatchException", async () => {
      cognito.confirmSignUp.mockRejectedValueOnce(new CodeError())
      const result = await env.finishRegisteringAccount(
        USPhoneNumber.parse("1234567890")!,
        "123456"
      )
      expect(result).toEqual("invalid-verification-code")
    })

    it("should forward error when cognito throws a non-CodeMismatchException", async () => {
      cognito.confirmSignUp.mockRejectedValueOnce(new Error())
      const resultPromise = env.finishRegisteringAccount(
        USPhoneNumber.parse("1234567890")!,
        "123456"
      )
      expect(resultPromise).rejects.toBeInstanceOf(Error)
    })

    it("should return user handle from API when verification code is valid", async () => {
      const handle = UserHandle.parse("test").handle!
      cognito.confirmSignUp.mockResolvedValueOnce("SUCCESS")
      mswServer.use(
        rest.post("https://localhost:8080/user", async (_, res, ctx) => {
          return res(
            ctx.status(201),
            ctx.json({ id: uuid(), handle: handle.rawValue })
          )
        })
      )
      const result = await env.finishRegisteringAccount(
        USPhoneNumber.parse("1234567890")!,
        "123456"
      )
      expect(result).toEqual(handle)
    })
  })
})
