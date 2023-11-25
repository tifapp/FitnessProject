import { TiFAPI } from "@api-client/TiFAPI"
import { createAWSTiFAPIFetch } from "@api-client/aws"
import {
  ForgotPasswordParamsList,
  createForgotPasswordScreens
} from "@auth/forgot-password"
import { createForgotPasswordEnvironment } from "@auth/forgot-password/Environment"
import {
  CognitoSignInAuthenticator,
  SignInParamsList,
  createSignInScreens
} from "@auth/sign-in"
import {
  SignUpParamsList,
  cognitoConfirmSignUpWithAutoSignIn,
  createSignUpEnvironment,
  createSignUpScreens
} from "@auth/sign-up"
import { Auth } from "@aws-amplify/auth"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"

export type AuthNavigationStackParamList = SignInParamsList &
  SignUpParamsList &
  ForgotPasswordParamsList

const Stack = createStackNavigator<AuthNavigationStackParamList>()

const tiFAPI = new TiFAPI(
  createAWSTiFAPIFetch(
    new URL("https://623qsegfb9.execute-api.us-west-2.amazonaws.com/prod/")
  )
)

const signInScreens = createSignInScreens<AuthNavigationStackParamList>(
  Stack,
  new CognitoSignInAuthenticator(Auth)
)

const signUpEnvironment = createSignUpEnvironment(
  {
    signUp: async (request) => await Auth.signUp(request),
    resendSignUp: async (username: string) => {
      await Auth.resendSignUp(username)
    },
    confirmSignUpWithAutoSignIn: cognitoConfirmSignUpWithAutoSignIn
  },
  tiFAPI
)

const signUpScreens = createSignUpScreens<AuthNavigationStackParamList>(
  Stack,
  signUpEnvironment
)

const forgotPasswordEnvironment = createForgotPasswordEnvironment(Auth)

const forgotPasswordScreens =
  createForgotPasswordScreens<AuthNavigationStackParamList>(
    Stack,
    forgotPasswordEnvironment
  )

export const AuthNavigationStack = () => {
  return (
    <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        {signInScreens}
        {signUpScreens}
        {forgotPasswordScreens}
      </Stack.Group>
    </Stack.Navigator>
  )
}
