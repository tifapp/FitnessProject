import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import {
  ForgotPasswordScreen,
  ResetPasswordScreen,
  VerifyCodeScreen
} from "@screens/ProfileScreen/Navigation/SignInScreensNavigation"
import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"

describe("Forgot Password Flow tests", () => {
  it("starts with forgot password, has a success, goes to verify code screen ", async () => {
    const Stack = createStackNavigator()
    const { getByText } = render(
      <TiFQueryClientProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="ForgotPasswordScreen"
                component={ForgotPasswordScreen}
              />
              <Stack.Screen
                name="VerifyCodeScreen"
                component={VerifyCodeScreen}
              />
              <Stack.Screen
                name="ResetPasswordScreen"
                component={ResetPasswordScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </TiFQueryClientProvider>
    )
    fireEvent.press(getByText("Reset Password"))
    expect(screen.getByText("Verify your Acccount")).toBeTruthy()
  })
})
