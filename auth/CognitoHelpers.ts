import { AuthError } from "@aws-amplify/auth"

/**
 * Returns true if the given error object is an instance of {@link AuthError} and has a property
 * `code` that matches the given Cognito error code.
 */
export const isCognitoErrorWithCode = (error: unknown, code: string) => {
  if (error instanceof AuthError) {
    return error.name === code
  }
  return false
}

export const simpleAuthError = (error: string) => {
  return new AuthError({ message: "", name: error })
}
