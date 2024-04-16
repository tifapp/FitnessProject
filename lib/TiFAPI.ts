import { Auth } from "@aws-amplify/auth"
import { API_URL } from "@env"
import {
  TiFAPI,
  TiFAPITransport,
  jwtMiddleware,
  tifAPITransport
} from "TiFShared/api"

const awsAmplifyLoadBearerToken = async () => {
  try {
    return (await Auth.currentSession()).getIdToken().getJwtToken()
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
  return tifAPITransport(url, jwtMiddleware(awsAmplifyLoadBearerToken))
}

declare module "TiFShared/api" {
  export interface TiFAPIConstructor {
    /**
     * An instance of {@link TiFAPI} that is pointed at the production backend.
     */
    productionInstance: TiFAPI
  }
}

TiFAPI.productionInstance = new TiFAPI(awsTiFAPITransport(new URL(API_URL)))
