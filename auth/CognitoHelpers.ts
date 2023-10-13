import { Auth } from "@aws-amplify/auth"
import awsExports from "../src/aws-exports"
import { CognitoSecureStorage } from "./CognitoSecureStorage"
import { EmailAddress } from "./Email"
import { USPhoneNumber } from "./PhoneNumber"
import * as ExpoSecureStore from "expo-secure-store"

/**
 * Sets up cognito with a secure store.
 */
export const setupCognito = () => {
  Auth.configure({
    ...awsExports,
    storage: new CognitoSecureStorage(ExpoSecureStore)
  })
}

/**
 * An error code thrown by cognito.
 */
export type CognitoErrorCode =
  | "CodeMismatchException"
  | "UsernameExistsException"

/**
 * An {@link Error} subclass that mimicks a Cognito error for testing purposes.
 *
 * This is useful because cognito just adds a `code` field to {@link Error} directly,
 * which is invalid typescript.
 */
export class TestCognitoError extends Error {
  code: CognitoErrorCode

  constructor (code: CognitoErrorCode) {
    super()
    this.code = code
  }
}

/**
 * Returns true if the given error object is an instance of {@link Error} and has a property
 * `code` that matches the given Cognito error code.
 */
export const isCognitoErrorWithCode = (
  error: unknown,
  code: CognitoErrorCode
) => {
  if (error instanceof Error && "code" in error) {
    return error.code === code
  }
  return false
}

/**
 * Formats an email or phone number in the way cognito expects it.
 *
 * Phone Number -> `emailOrPhoneNumber.e164Formatted`
 *
 * Email -> `emailOrPhoneNumber.toString()`
 */
export const cognitoFormatEmailOrPhoneNumber = (
  emailOrPhoneNumber: EmailAddress | USPhoneNumber
) => {
  return emailOrPhoneNumber instanceof USPhoneNumber
    ? emailOrPhoneNumber.e164Formatted
    : emailOrPhoneNumber.toString()
}
