import { EmailAddress, USPhoneNumber } from "../auth/Models"
import {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  COGNITO_USER_POOL_ID
} from "env"
import AWS from "aws-sdk"

AWS.config.update({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
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
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: emailOrPhoneNumber.toString()
    })
    .promise()
}
