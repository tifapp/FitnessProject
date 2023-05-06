import { CognitoUser } from "amazon-cognito-identity-js"
import { Auth } from "aws-amplify"
import { CognitoIdentityCredentials } from "aws-sdk"

export interface AuthDetails {
  isLoggedIn: boolean
  jwtToken: string | null
  awsCredentials: CognitoIdentityCredentials | null
  cognitoUser: CognitoUser | null
}

// fetch + aws auth headers
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  try {
    const session = await Auth.currentSession()
    const jwtToken = session.getIdToken().getJwtToken()

    options.headers = {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`
    }

    return await fetch(url, options)
  } catch (error) {
    console.error("Error fetching data:", error)
    throw error
  }
}
