import { createForgotPasswordEnvironment } from "@auth-boundary/forgot-password"
import {
  ForgotPasswordParamsList,
  createForgotPasswordScreens
} from "@core-root/navigation/auth/ForgotPassword"
import { Auth } from "@aws-amplify/auth"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StoryMeta } from ".storybook/HelperTypes"
const ForgotPasswordMeta: StoryMeta = {
  title: "Forgot Password"
}

export default ForgotPasswordMeta

type ForgotPasswordStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator<ForgotPasswordParamsList>()

const signUpScreens = createForgotPasswordScreens(
  Stack,
  createForgotPasswordEnvironment(Auth)
)

export const Basic: ForgotPasswordStory = () => (
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
