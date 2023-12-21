import { isCognitoErrorWithCode } from "@auth/CognitoHelpers"
import { confirmResetPassword, resetPassword } from "@aws-amplify/auth"
import { EmailAddress, Password, USPhoneNumber } from ".."

export type CognitoResetPassword = {
  resetPassword: typeof resetPassword
  confirmResetPassword: typeof confirmResetPassword
}

export type ForgotPasswordResult =
  | "success"
  | "invalid-email"
  | "invalid-phone-number"
export type ResetPasswordResult = "valid" | "invalid-verification-code"

/**
 * Creates the functions needed for the forgot password flow.
 */
export const createForgotPasswordEnvironment = (
  cognito: CognitoResetPassword
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
      await cognito.resetPassword({ username: emailOrPhoneNumber.toString() })
      return "success"
    } catch (err) {
      if (!isCognitoErrorWithCode(err, "UserNotFoundException")) throw err
      return emailOrPhoneNumber instanceof EmailAddress
        ? "invalid-email"
        : "invalid-phone-number"
    }
  },
  /**
   * Attemps to resend a forgot password code.
   *
   * @param emailOrPhoneNumber the email or phone number of the account to resend the code to.
   */
  resendForgotPasswordCode: async (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  ) => {
    await cognito.resetPassword({ username: emailOrPhoneNumber.toString() })
  },
  /**
   * Resets the user's password.
   *
   * @param emailOrPhoneNumber an email or phone number that the user provides.
   * @param verificationCode the verification code from a cognito forgot password flow.
   * @param password the new password to reset to.
   */
  submitResettedPassword: async (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    verificationCode: string,
    password: Password
  ): Promise<ResetPasswordResult> => {
    try {
      await cognito.confirmResetPassword({
        username: emailOrPhoneNumber.toString(),
        confirmationCode: verificationCode,
        newPassword: password.toString()
      })
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
