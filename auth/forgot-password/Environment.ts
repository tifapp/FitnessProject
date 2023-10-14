import {
  cognitoFormatEmailOrPhoneNumber,
  isCognitoErrorWithCode
} from "@auth/CognitoHelpers"
import { Auth } from "@aws-amplify/auth"
import { EmailAddress, Password, USPhoneNumber } from ".."

export type ForgotPasswordResult =
  | "success"
  | "invalid-email"
  | "invalid-phone-number"
export type ResetPasswordResult = "valid" | "invalid-verification-code"

/**
 * Creates the functions needed for the sign-up flow.
 */
export const createForgotPasswordEnvironment = (
  cognito: Pick<typeof Auth, "forgotPassword" | "forgotPasswordSubmit">
) => ({
  /**
   * Starts the process of sending you a code for the password you forgot.
   *
   * @param emailOrPhoneNumber an email or phone number that the user provides.
   */
  initiateForgotPassword: async (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  ): Promise<ForgotPasswordResult> => {
    try {
      await cognito.forgotPassword(
        cognitoFormatEmailOrPhoneNumber(emailOrPhoneNumber)
      )
      return "success"
    } catch (err) {
      if (!isCognitoErrorWithCode(err, "UserNotFoundException")) throw err
      return "invalid-email"
    }
  },
  /**
   * Starts the process of sending you a code for the password you forgot.
   *
   * @param emailOrPhoneNumber an email or phone number that the user provides.
   */
  submitResettedPassword: async (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    code: string,
    newPass: Password
  ): Promise<ResetPasswordResult> => {
    try {
      await cognito.forgotPasswordSubmit(
        cognitoFormatEmailOrPhoneNumber(emailOrPhoneNumber),
        code,
        newPass.toString()
      )
      return "valid"
    } catch (err) {
      if (!isCognitoErrorWithCode(err, "CodeMismatchException")) throw err
      return "invalid-verification-code"
    }
  }
})

export type ForgotPasswordEnvironment = ReturnType<
  typeof createForgotPasswordEnvironment
>
