import { isCognitoErrorWithCode } from "@auth/CognitoHelpers"
import { signIn, confirmSignIn, resendSignUpCode } from "@aws-amplify/auth"
import { EmailAddress, USPhoneNumber } from ".."

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

export type CognitoSignInFunctions = {
  signIn: typeof signIn
  confirmSignIn: typeof confirmSignIn
  resendSignUpCode: typeof resendSignUpCode
}

/**
 * An {@link SignInAuthenticator} implemented with Cognito.
 */
export class CognitoSignInAuthenticator implements SignInAuthenticator {
  private readonly cognito: CognitoSignInFunctions

  private previousSignInCredentials?: {
    username: string
    password: string
  }

  constructor (
    cognito: CognitoSignInFunctions = {
      signIn,
      confirmSignIn,
      resendSignUpCode
    }
  ) {
    this.cognito = cognito
  }

  async signIn (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    uncheckedPassword: string
  ) {
    try {
      const credentials = {
        username: emailOrPhoneNumber.toString(),
        password: uncheckedPassword
      }
      this.previousSignInCredentials = credentials
      const { isSignedIn } = await this.cognito.signIn(credentials)
      return !isSignedIn ? "sign-in-verification-required" : "success"
    } catch (err) {
      if (
        isCognitoErrorWithCode(err, "NotAuthorizedException") ||
        isCognitoErrorWithCode(err, "UserNotFoundException")
      ) {
        return "incorrect-credentials"
      } else if (isCognitoErrorWithCode(err, "UserNotConfirmedException")) {
        await this.cognito.resendSignUpCode({
          username: emailOrPhoneNumber.toString()
        })
        return "sign-up-verification-required"
      } else {
        throw err
      }
    }
  }

  async resendSignInVerificationCode () {
    if (!this.previousSignInCredentials) return
    await this.cognito.signIn(this.previousSignInCredentials)
  }

  async verifySignIn (verificationCode: string) {
    try {
      await this.cognito.confirmSignIn({ challengeResponse: verificationCode })
      return "success"
    } catch (err) {
      if (isCognitoErrorWithCode(err, "CodeMismatchException")) {
        return "invalid-verification-code"
      }
      throw err
    }
  }
}
