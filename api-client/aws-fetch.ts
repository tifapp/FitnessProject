import { CognitoUser } from "amazon-cognito-identity-js"
import { Auth } from "aws-amplify"
import { CognitoIdentityCredentials } from "aws-sdk"

export interface AuthDetails {
  isLoggedIn: boolean
  jwtToken: string | null
  awsCredentials: CognitoIdentityCredentials | null
  cognitoUser: CognitoUser | null
}

globalThis.cognitoAuth = {}

// fetch + aws auth headers
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  if (!globalThis.cognitoAuth.isLoggedIn) {
    console.error("User not authenticated")
    throw new Error("User not authenticated")
  }

  try {
    if (!globalThis.cognitoAuth) {
      const session = await Auth.currentSession()
      const token = session.getAccessToken()
      globalThis.cognitoAuth.jwtToken = token
    }

    options.headers = {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${globalThis.cognitoAuth.jwtToken}`
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error("Network response was not ok")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching data:", error)
    throw error
  }
}
