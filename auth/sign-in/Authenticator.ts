import {
  cognitoFormatEmailOrPhoneNumber,
  isCognitoErrorWithCode
} from "@auth/CognitoHelpers"
import { Auth } from "@aws-amplify/auth"
import { EmailAddress, USPhoneNumber } from ".."
import { CognitoUser } from "amazon-cognito-identity-js"

export type SignInResult =
  | "success"
  | "incorrect-credentials"
  | "sign-in-verification-required"
  | "sign-up-verification-required"

export type VerifySignInResult = "success" | "invalid-verification-code"

/**
 * An interface for managing a sign-in flow.
 */
export interface SignInAuthenticator {
  /**
   * Signs the user in and returns the result of how the sign in went.
   *
   * @param emailOrPhoneNumber the user's email or phone number.
   * @param uncheckedPassword a password that hasn't been checked for correctness.
   */
  signIn(
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    uncheckedPassword: string
  ): Promise<SignInResult>

  /**
   * Resends the sign in verification code if `signIn` returned `"sign-in-verification-required"`.
   */
  resendSignInVerificationCode(): Promise<void>

  /**
   * Verifies the user's sign in attempt.
   *
   * @param verificationCode the verification code that the user needs to verify with.
   */
  verifySignIn(verificationCode: string): Promise<VerifySignInResult>
}

export type CognitoSignInFunctions = Pick<
  typeof Auth,
  "confirmSignIn" | "signIn" | "resendSignUp"
>

/**
 * An {@link SignInAuthenticator} implemented with Cognito.
 */
export class CognitoSignInAuthenticator implements SignInAuthenticator {
  private readonly cognito: CognitoSignInFunctions

  private signedInCognitoUser?: CognitoUser
  private previousSignInCredentials?: {
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
    uncheckedPassword: string
  }

  constructor (cognito: CognitoSignInFunctions = Auth) {
    this.cognito = cognito
  }

  async signIn (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    uncheckedPassword: string
  ) {
    try {
      this.previousSignInCredentials = {
        emailOrPhoneNumber,
        uncheckedPassword
      }
      this.signedInCognitoUser = await this.cognito.signIn(
        cognitoFormatEmailOrPhoneNumber(emailOrPhoneNumber),
        uncheckedPassword
      )
      return this.signedInCognitoUser?.challengeName === "SMS_MFA"
        ? "sign-in-verification-required"
        : "success"
    } catch (err) {
      if (
        isCognitoErrorWithCode(err, "NotAuthorizedException") ||
        isCognitoErrorWithCode(err, "UserNotFoundException")
      ) {
        return "incorrect-credentials"
      } else if (isCognitoErrorWithCode(err, "UserNotConfirmedException")) {
        await this.cognito.resendSignUp(
          cognitoFormatEmailOrPhoneNumber(emailOrPhoneNumber)
        )
        return "sign-up-verification-required"
      } else {
        throw err
      }
    }
  }

  async resendSignInVerificationCode () {
    if (!this.previousSignInCredentials) return
    this.signedInCognitoUser = await this.cognito.signIn(
      cognitoFormatEmailOrPhoneNumber(
        this.previousSignInCredentials.emailOrPhoneNumber
      ),
      this.previousSignInCredentials.uncheckedPassword
    )
  }

  async verifySignIn (verificationCode: string) {
    try {
      await this.cognito.confirmSignIn(
        this.signedInCognitoUser,
        verificationCode,
        "SMS_MFA"
      )
      return "success"
    } catch (err) {
      if (isCognitoErrorWithCode(err, "CodeMismatchException")) {
        return "invalid-verification-code"
      }
      throw err
    }
  }
}
