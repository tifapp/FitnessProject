import { createDependencyKey, useDependencyValue } from "@lib/dependencies"
import { CognitoUser, CognitoUserSession } from "amazon-cognito-identity-js"
import { CognitoIdentityCredentials } from "aws-sdk"

const { AWS_REGION, COGNITO_USER_POOL_ID, IDENTITY_POOL_ID } = process.env

const loginsKey = `cognito-idp.${AWS_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`

export interface AuthDetails {
  isLoggedIn: boolean
  jwtToken: string | null
  awsCredentials: CognitoIdentityCredentials | null
  cognitoUser: CognitoUser | null
}

global.authDetails = {
  isLoggedIn: false,
  jwtToken: null,
  awsCredentials: null,
  cognitoUser: null
}

/**
 * Dependency keys for doing geocoding.
 */
export namespace CognitoDependencyKeys {
  // TODO: - Live Value
  export const authSession = createDependencyKey<AuthDetails>()
}

/**
 * Reverse geocodes the most accurrate location for the given coordinates.
 */
export const useCognitoDependencyKey = () => {
  return useDependencyValue(CognitoDependencyKeys.authSession)
}

export async function refreshToken (callback?: () => void): Promise<void> {
  if (!authDetails.cognitoUser) {
    console.error("User not authenticated")
    return
  }

  try {
    const session = await new Promise<CognitoUserSession>((resolve, reject) => {
      authDetails.cognitoUser!.getSession((err, session) => {
        if (err) reject(err)
        else resolve(session)
      })
    })

    if (session.isValid()) {
      // Update authDetails with the refreshed session
      authDetails.jwtToken = session.getIdToken().getJwtToken()
      authDetails.awsCredentials = new CognitoIdentityCredentials({
        IdentityPoolId: IDENTITY_POOL_ID!,
        Logins: {
          [loginsKey]: session.getIdToken().getJwtToken()
        }
      })
    } else {
      console.error("Session expired")
    }
  } catch (error) {
    console.error("Error getting session:", error)
  }
}

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  if (!authDetails.isLoggedIn) {
    console.error("User not authenticated")
    throw new Error("User not authenticated")
  }

  try {
    const session = await new Promise<CognitoUserSession>((resolve, reject) => {
      authDetails.cognitoUser!.getSession((err, session) => {
        if (err) reject(err)
        else resolve(session)
      })
    })

    if (!session.isValid()) {
      await refreshToken()
    }

    options.headers = {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: authDetails.jwtToken!
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
