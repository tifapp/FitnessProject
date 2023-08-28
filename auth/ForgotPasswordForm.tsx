import { Auth } from "aws-amplify"

// To initiate the process of verifying the attribute like 'phone_number' or 'email'
async function verifyCurrentUserAttribute (attr: string) {
  try {
    await Auth.verifyCurrentUserAttribute(attr)
    console.log("a verification code is sent")
  } catch (err) {
    console.log("failed with error", err)
  }
}
