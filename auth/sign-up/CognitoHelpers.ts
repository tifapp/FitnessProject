import { confirmSignUp, autoSignIn } from "@aws-amplify/auth"

/**
 * Confirms a sign-up and waits for auto-sign-in.
 *
 * @param username the username to give to cognito.
 * @param code the verification code to give to cognito.
 */
export const cognitoConfirmSignUpWithAutoSignIn = async (
  username: string,
  confirmationCode: string
) => {
  await confirmSignUp({ username, confirmationCode })
  await autoSignIn()
}
