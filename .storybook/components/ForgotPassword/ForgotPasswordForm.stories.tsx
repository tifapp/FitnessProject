import { StoryMeta } from ".storybook/HelperTypes"
import { createForgotPasswordEnvironment } from "@auth-boundary/forgot-password"
import { Auth } from "@aws-amplify/auth"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import {
  ForgotPasswordParamsList,
  createForgotPasswordScreens
} from "@core-root/navigation/auth/ForgotPassword"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
const ForgotPasswordMeta: StoryMeta = {
  title: "Forgot Password"
}

export default ForgotPasswordMeta

const Stack = createStackNavigator<ForgotPasswordParamsList>()

const signUpScreens = createForgotPasswordScreens(
  Stack,
  createForgotPasswordEnvironment(Auth)
)

export const Basic = () => (
  <TiFQueryClientProvider>
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="forgotPassword"
          screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}
        >
          {signUpScreens}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  </TiFQueryClientProvider>
)
