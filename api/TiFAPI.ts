import { Auth } from "@aws-amplify/auth"
import { API_URL } from "@env"
import { CognitoUserSession } from "amazon-cognito-identity-js"
import {
  APIMiddleware,
  TiFAPI,
  TiFAPIClientCreator,
  jwtMiddleware,
  tifAPITransport,
  validateTiFAPIClientCall
} from "TiFShared/api"
import { chainMiddleware } from "TiFShared/lib/Middleware"
import { AlphaUserStorage } from "@user/alpha"
import { LaunchArguments, launchArguments } from "@lib/LaunchArguments"

const userSession = () => Auth.currentSession()

/**
 * Loads a cognito formatted bearer token using either the specified
 * {@link LaunchArguments} or from the current user session if no launch
 * argument token is provided.
 */
export const bearerToken = async (
  launchArgs: LaunchArguments = launchArguments,
  storage: AlphaUserStorage = AlphaUserStorage.default,
  currentSession: () => Promise<CognitoUserSession> = userSession
) => {
  try {
    if (launchArgs.testCognitoUserToken) {
      return launchArgs.testCognitoUserToken.getJwtToken()
    }
    const alphaUser = await storage.user()
    if (alphaUser) return alphaUser.token
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
export const awsTiFAPITransport = (url: URL): APIMiddleware => {
  return chainMiddleware(
    validateTiFAPIClientCall,
    jwtMiddleware(bearerToken),
    tifAPITransport(url)
  )
}

declare module "TiFShared/api" {
  export interface TiFAPIConstructor {
    /**
     * An instance of {@link TiFAPI} that is pointed at the production backend.
     */
    productionInstance: TiFAPI
  }
}

TiFAPI.productionInstance = TiFAPIClientCreator(
  awsTiFAPITransport(launchArguments.apiURL ?? new URL(API_URL))
)
