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

/**
 * Returns true if the given error object is an instance of {@link Error} and has a property
 * `code` that matches Cognito's error code for an invalid verification code.
 */
export const isCognitoCodeMismatchError = (error: unknown) => {
  if (error instanceof Error && "code" in error) {
    return error.code === COGNITO_CODE_MISMATCH_EXCEPTION_ERROR_CODE
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
