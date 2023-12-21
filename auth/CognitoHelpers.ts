/**
 * An error code thrown by cognito.
 */
export type CognitoErrorCode =
  | "CodeMismatchException"
  | "UsernameExistsException"
  | "NotAuthorizedException"
  | "UserNotFoundException"
  | "UserNotConfirmedException"
  | "InvalidParameterException"

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
export const isCognitoErrorWithCode = (error: unknown, code: string) => {
  if (error instanceof Error && "code" in error) {
    return error.code === code
  }
  return false
}
