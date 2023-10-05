import { Auth } from "@aws-amplify/auth"
import awsExports from "../src/aws-exports"
import { AmplifySecureStorage } from "./SecureStorage"
import * as ExpoSecureStore from "expo-secure-store"

/**
 * Sets up cognito with the right config.
 */
export const setupCognito = () => {
  Auth.configure({
    ...awsExports,
    storage: new AmplifySecureStorage(ExpoSecureStore)
  })
}
