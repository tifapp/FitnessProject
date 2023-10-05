import { Auth } from "@aws-amplify/auth"
import { EmailAddress, USPhoneNumber } from ".."

export const createSignUpEnvironment = (
  cognito: Pick<typeof Auth, "signUp" | "resendSignUp">
) => ({
  createAccount: async (
    name: string,
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    uncheckedPassword: string
  ) => {
    await cognito.signUp({
      username: cognitoFormatted(emailOrPhoneNumber),
      password: uncheckedPassword,
      attributes: {
        name,
        email:
          emailOrPhoneNumber instanceof USPhoneNumber
            ? undefined
            : cognitoFormatted(emailOrPhoneNumber),
        phoneNumber:
          emailOrPhoneNumber instanceof USPhoneNumber
            ? cognitoFormatted(emailOrPhoneNumber)
            : undefined
      },
      autoSignIn: {
        enabled: true
      }
    })
  },
  resendVerificationCode: async (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  ) => {
    await cognito.resendSignUp(cognitoFormatted(emailOrPhoneNumber))
  }
})

const cognitoFormatted = (emailOrPhoneNumber: EmailAddress | USPhoneNumber) => {
  return emailOrPhoneNumber instanceof USPhoneNumber
    ? emailOrPhoneNumber.e164Formatted
    : emailOrPhoneNumber.toString()
}
