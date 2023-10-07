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

export const COGNITO_CODE_MISMATCH_EXCEPTION_ERROR_CODE =
  "CodeMismatchException"

export const COGNITO_USERNAME_EXISTS_ERROR_CODE = "UsernameExistsException"

export type CognitoErrorCode =
  | "CodeMismatchException"
  | "UsernameExistsException"

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
