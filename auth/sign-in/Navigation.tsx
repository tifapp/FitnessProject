import {
  BASE_HEADER_SCREEN_OPTIONS,
  StackNavigatorType,
  XMarkBackButton
} from "@components/Navigation"
import { SignInAuthenticator } from "./Authenticator"
import { NavigatorScreenParams } from "@react-navigation/native"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import React, { memo } from "react"
import { SignInFormView, useSignInForm } from "./SignInForm"

export type SignInModalParamsList = {
  signInForm: undefined
}

export type SignInParamsList = {
  signIn: NavigatorScreenParams<SignInModalParamsList>
}

export const createSignInScreens = <Params extends SignInParamsList>(
  stack: StackNavigatorType<Params>,
  authenticator: SignInAuthenticator
) => (
    <stack.Screen
      name="signIn"
      options={{ presentation: "modal", headerShown: false }}
    >
      {(props: StackScreenProps<SignInParamsList, "signIn">) => (
        <SignInModalScreen {...props} authenticator={authenticator} />
      )}
    </stack.Screen>
  )

const SignInModalStack = createStackNavigator<SignInModalParamsList>()

type SignInModalScreenProps = StackScreenProps<SignInParamsList, "signIn"> & {
  authenticator: SignInAuthenticator
}

const SignInModalScreen = memo(function Screen ({
  authenticator
}: SignInModalScreenProps) {
  return (
    <SignInModalStack.Navigator
      screenOptions={BASE_HEADER_SCREEN_OPTIONS}
      initialRouteName="signInForm"
    >
      <SignInModalStack.Screen
        name="signInForm"
        options={{ headerLeft: XMarkBackButton, title: "" }}
      >
        {(props) => (
          <SignInFormScreen {...props} authenticator={authenticator} />
        )}
      </SignInModalStack.Screen>
    </SignInModalStack.Navigator>
  )
})

type SignInFormScreenProps = StackScreenProps<
  SignInModalParamsList,
  "signInForm"
> & {
  authenticator: SignInAuthenticator
}

const SignInFormScreen = memo(function Screen ({
  navigation,
  authenticator
}: SignInFormScreenProps) {
  const form = useSignInForm({
    signIn: async (emailOrPhoneNumber, uncheckedPassword) => {
      return await authenticator.signIn(emailOrPhoneNumber, uncheckedPassword)
    },
    onSuccess: () => navigation.getParent()?.goBack()
  })
  return <SignInFormView {...form} onForgotPasswordTapped={() => {}} />
})
