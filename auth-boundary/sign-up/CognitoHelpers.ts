import { Auth } from "@aws-amplify/auth"
import { Hub } from "@aws-amplify/core"

/**
 * Confirms a sign-up and waits for auto-sign-in.
 *
 * @param name the name to give to cognito.
 * @param code the verification code to give to cognito.
 */
export const cognitoConfirmSignUpWithAutoSignIn = async (
  name: string,
  code: string
) => {
  const result = await Auth.confirmSignUp(name, code)
  return await new Promise<typeof result>((resolve, reject) => {
    Hub.listen("auth", ({ payload }) => {
      if (payload.event === "autoSignIn") {
        resolve(result)
      } else if (payload.event === "autoSignIn_failure") {
        reject(new Error("Auto Sign in Failed"))
      }
    })
  })
}
