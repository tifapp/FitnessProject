import { API_URL } from "env"
import { createTiFAPIFetch } from "./client"
import { Auth } from "aws-amplify"
export * from "./client"

const awsAmplifyLoadBearerToken = async () => {
  return (await Auth.currentSession()).getIdToken().getJwtToken()
}

export const tifAPIFetch = createTiFAPIFetch(
  new URL(API_URL),
  awsAmplifyLoadBearerToken
)
