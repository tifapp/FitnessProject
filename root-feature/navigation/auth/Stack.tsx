import { TiFAPI } from "@api-client/TiFAPI"
import { createForgotPasswordEnvironment } from "@auth/forgot-password"
import { CognitoSignInAuthenticator } from "@auth/sign-in"
import {
  cognitoConfirmSignUpWithAutoSignIn,
  createSignUpEnvironment
} from "@auth/sign-up"
import { Auth } from "@aws-amplify/auth"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { SignUpParamsList, createSignUpScreens } from "./SignUp"
import {
  ForgotPasswordParamsList,
  createForgotPasswordScreens
} from "./ForgotPassword"
import { SignInParamsList, createSignInScreens } from "./SignIn"

export type AuthNavigationStackParamList = SignInParamsList &
  SignUpParamsList &
  ForgotPasswordParamsList

const Stack = createStackNavigator<AuthNavigationStackParamList>()

const tiFAPI = TiFAPI.productionInstance

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
