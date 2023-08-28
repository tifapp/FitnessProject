import { Auth } from "aws-amplify"

// To verify attribute with the code
async function verifyCurrentUserAttributeSubmit (
  attr: string,
  verificationCode: string
) {
  try {
    await Auth.verifyCurrentUserAttributeSubmit(attr, verificationCode)
    console.log("phone_number verified")
  } catch (err) {
    console.log("failed with error", err)
  }
}
