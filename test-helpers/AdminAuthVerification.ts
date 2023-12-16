import { EmailAddress, USPhoneNumber } from "../auth/Models"
import AWS from "aws-sdk"

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const cognito = new AWS.CognitoIdentityServiceProvider()

/**
 * Automatically confirms a sign-up for testing purposes without needing the sign-up code.
 */
export const adminVerifySignUpForTesting = async (
  emailOrPhoneNumber: EmailAddress | USPhoneNumber
) => {
  await cognito
    .adminConfirmSignUp({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: emailOrPhoneNumber.toString()
    })
    .promise()
}
