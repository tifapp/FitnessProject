import { Auth } from "@aws-amplify/auth"
import { TiFAPIFetch, createTiFAPIFetch } from "./client"

const awsAmplifyLoadBearerToken = async () => {
  return (await Auth.currentSession()).getIdToken().getJwtToken()
}

/**
 * Creates a {@link TiFAPIFetch} that uses AWS Cognito as the backing token storage.
 *
 * @param url the base url of the API.
 */
export const createAWSTiFAPIFetch = (url: URL): TiFAPIFetch => {
  return createTiFAPIFetch(new URL(url), awsAmplifyLoadBearerToken)
}
