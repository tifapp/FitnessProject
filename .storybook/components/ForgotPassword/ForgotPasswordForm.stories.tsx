import {
  CognitoResetPassword,
  createForgotPasswordEnvironment
} from "@auth/forgot-password/Environment"
import {
  ForgotPasswordParamsList,
  createForgotPasswordScreens
} from "@auth/forgot-password/ForgotPasswordNavigation"
import { confirmResetPassword, resetPassword } from "@aws-amplify/auth"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
const ForgotPasswordMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Forgot Password"
}

export default ForgotPasswordMeta

const resetPasswordAuth: CognitoResetPassword = {
  resetPassword,
  confirmResetPassword
}

type ForgotPasswordStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator<ForgotPasswordParamsList>()

const signUpScreens = createForgotPasswordScreens(
  Stack,
  createForgotPasswordEnvironment(resetPasswordAuth)
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
