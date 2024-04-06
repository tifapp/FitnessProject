import { Auth } from "@aws-amplify/auth"
import { TiFAPITransport, jwtMiddleware, tifAPITransport } from "TiFShared/api"

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
