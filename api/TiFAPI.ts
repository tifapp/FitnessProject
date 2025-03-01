import { Auth } from "@aws-amplify/auth"
import { API_URL, BUILD_TYPE } from "@env"
import { CognitoUserSession } from "amazon-cognito-identity-js"
import {
  APIMiddleware,
  TiFAPI,
  TiFAPIClientCreator,
  jwtMiddleware,
  requestIdMiddleware,
  requestLoggingMiddleware,
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
 * @param url The base url of the API.
 * @param jwt A function to load the user's jwt token for the API.
 */
export const awsTiFAPITransport = (
  url: URL,
  jwt: () => Promise<string | undefined> = bearerToken
): APIMiddleware => {
  return chainMiddleware(
    requestIdMiddleware(),
    validateTiFAPIClientCall,
    requestLoggingMiddleware("tif"),
    jwtMiddleware(jwt),
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

console.log(API_URL)

TiFAPI.productionInstance = TiFAPIClientCreator(
  awsTiFAPITransport(launchArguments.apiURL ?? new URL(API_URL))
)
