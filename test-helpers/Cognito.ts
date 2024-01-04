import { AuthError } from "@aws-amplify/auth"

export const testAuthErrorWithCode = (error: string) => {
  return new AuthError({ message: "", name: error })
}
