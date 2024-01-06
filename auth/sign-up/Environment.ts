import { signUp, resendSignUpCode } from "@aws-amplify/auth"
import { EmailAddress, Password, USPhoneNumber } from ".."
import { TiFAPI } from "@api-client/TiFAPI"
import { isCognitoErrorWithCode } from "@auth/CognitoHelpers"
import { UserHandle } from "@content-parsing"
import { cognitoConfirmSignUpWithAutoSignIn } from "./CognitoHelpers"

export type CreateAccountResult =
  | "success"
  | "phone-number-already-exists"
  | "email-already-exists"

export type CognitoSignUpFunctions = {
  signUp: typeof signUp
  resendSignUpCode: typeof resendSignUpCode
  confirmSignUpWithAutoSignIn: typeof cognitoConfirmSignUpWithAutoSignIn
}

/**
 * Creates the functions needed for the sign-up flow.
 */
export const createSignUpEnvironment = (
  cognito: CognitoSignUpFunctions,
  tifAPI: TiFAPI
) => ({
  /**
   * Creates the user's account on Cognito.
   *
   * @param name the display name of the user.
   * @param emailOrPhoneNumber an email or phone number that the user provides.
   * @param uncheckedPassword the user's password.
   */
  createAccount: async (
    name: string,
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    password: Password
  ): Promise<CreateAccountResult> => {
    try {
      const attributes = { name } as Record<string, string>
      // NB: If we have a phone number, then cognito throws an error if we have the email key and vice versa.
      const verificationAttributeKey =
        emailOrPhoneNumber instanceof USPhoneNumber ? "phone_number" : "email"
      attributes[verificationAttributeKey] = emailOrPhoneNumber.toString()
      await cognito.signUp({
        username: emailOrPhoneNumber.toString(),
        password: password.rawValue,
        options: {
          userAttributes: attributes,
          autoSignIn: true
        }
      })
      return "success"
    } catch (err) {
      if (!isCognitoErrorWithCode(err, "UsernameExistsException")) throw err
      return emailOrPhoneNumber instanceof USPhoneNumber
        ? "phone-number-already-exists"
        : "email-already-exists"
    }
  },
  /**
   * Resends a sign-up verification code.
   *
   * @param emailOrPhoneNumber the user's email or phone number.
   */
  resendVerificationCode: async (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  ) => {
    await cognito.resendSignUpCode({ username: emailOrPhoneNumber.toString() })
  },
  /**
   * Returns true if another user is using the given user handle.
   *
   * @param handle the {@link UserHandle} to check.
   * @param signal an {@link AbortSignal} to cancel the query.
   * @returns `true` if another user is using the given handle.
   */
  checkIfUserHandleTaken: async (handle: UserHandle, signal?: AbortSignal) => {
    return await tifAPI
      .autocompleteUsers(handle.rawValue, 1, signal)
      .then((resp) => resp.data.users[0]?.handle.isEqualTo(handle) ?? false)
  },
  /**
   * Changes the user's handle.
   *
   * @param handle the handle to change to.
   */
  changeUserHandle: async (handle: UserHandle) => {
    await tifAPI.updateCurrentUserProfile({ handle })
  },
  /**
   * Finishes registering the user's account by first verifying the sign-up code,
   * and then creating their TiF profile using the TiF API.
   *
   * @param emailOrPhoneNumber the user's email or phone number.
   * @param verificationCode the sign-up verification code the user received.
   * @returns the user's generated {@link UserHandle} if everything was successful
   * or `"invalid-verification-code"` if the user entered the wrong verification code.
   */
  finishRegisteringAccount: async (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    verificationCode: string
  ) => {
    try {
      await cognito.confirmSignUpWithAutoSignIn(
        emailOrPhoneNumber.toString(),
        verificationCode
      )
      return await tifAPI
        .createCurrentUserProfile()
        .then((resp) => resp.data.handle)
    } catch (error) {
      if (isCognitoErrorWithCode(error, "CodeMismatchException")) {
        return "invalid-verification-code" as const
      }
      throw error
    }
  }
})

export type SignUpEnvironment = ReturnType<typeof createSignUpEnvironment>
