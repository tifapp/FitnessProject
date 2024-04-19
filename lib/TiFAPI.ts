import { Auth } from "@aws-amplify/auth"
import { API_URL } from "@env"
import {
  TiFAPI,
  TiFAPITransport,
  jwtMiddleware,
  tifAPITransport
} from "TiFShared/api"
import { LaunchArguments, launchArguments } from "./LaunchArguments"
import { CognitoUserSession } from "amazon-cognito-identity-js"

const userSession = () => Auth.currentSession()

/**
 * Loads a cognito formatted bearer token using either the specified
 * {@link LaunchArguments} or from the current user session if no launch
 * argument token is provided.
 */
export const cognitoBearerToken = async (
  launchArgs: LaunchArguments = launchArguments,
  currentSession: () => Promise<CognitoUserSession> = userSession
) => {
  try {
    if (launchArgs.testCognitoUserToken) {
      return launchArgs.testCognitoUserToken.getJwtToken()
    }
    return (await currentSession()).getAccessToken().getJwtToken()
  } catch {
    return undefined
  }
}

/**
 * Creates a {@link TiFAPITransport} that uses AWS Cognito as the backing
 * token storage.
 *
 * @param url the base url of the API.
 */
export const awsTiFAPITransport = (url: URL): TiFAPITransport => {
  return tifAPITransport(url, jwtMiddleware(cognitoBearerToken))
}

declare module "TiFShared/api" {
  export interface TiFAPIConstructor {
    /**
     * An instance of {@link TiFAPI} that is pointed at the production backend.
     */
    productionInstance: TiFAPI
  }
}

TiFAPI.productionInstance = new TiFAPI(
  awsTiFAPITransport(launchArguments.apiURL ?? new URL(API_URL))
)
