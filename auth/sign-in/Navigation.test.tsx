import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import { CognitoSignInAuthenticator } from "./Authenticator"
import { TestQueryClientProvider } from "../../tests/helpers/ReactQuery"
import { NavigationContainer, useFocusEffect } from "@react-navigation/native"
import { SignInParamsList, createSignInScreens } from "./Navigation"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { useState, useCallback } from "react"
import { Button, View } from "react-native"
import { USPhoneNumber } from ".."

type TestParamsList = { test: undefined } & SignInParamsList

describe("SignInNavigation tests", () => {
  const TEST_PASSWORD = "12345678"
  const cognito = {
    signIn: jest.fn(),
    resendSignUp: jest.fn(),
    confirmSignIn: jest.fn()
  }
  const authenticator = new CognitoSignInAuthenticator(cognito)

  test("sign in with correct credentials", async () => {
    renderSignInScreens()
    beginSignInTest()

    enterPhoneNumberText(USPhoneNumber.mock.toString())
    enterPasswordText(TEST_PASSWORD)

    cognito.signIn.mockResolvedValueOnce({})
    submitSignInCredentials()

    await waitFor(() => expect(isAtEnd()).toEqual(true))
  })

  const enterPhoneNumberText = (text: string) => {
    fireEvent.changeText(
      screen.getByPlaceholderText("Phone number or Email"),
      text
    )
  }

  const enterPasswordText = (text: string) => {
    fireEvent.changeText(screen.getByPlaceholderText("Password"), text)
  }

  const submitSignInCredentials = () => {
    fireEvent.press(screen.getByText("I'm back!"))
  }

  const renderSignInScreens = () => {
    const Stack = createStackNavigator<TestParamsList>()
    const signInScreens = createSignInScreens(Stack, authenticator)
    return render(
      <TestQueryClientProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="test">
            {signInScreens}
            <Stack.Screen name="test" component={TestScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </TestQueryClientProvider>
    )
  }

  const IS_AT_END_TEST_ID = "test-sign-in-flow-end"

  const beginSignInTest = () => {
    fireEvent.press(screen.getByText("Begin Sign-in Test"))
  }

  const isAtEnd = () => !!screen.queryByTestId(IS_AT_END_TEST_ID)

  const TestScreen = ({
    navigation
  }: StackScreenProps<TestParamsList, "test">) => {
    const [focusCount, setFocusCount] = useState(0)
    useFocusEffect(
      useCallback(() => setFocusCount((focusCount) => focusCount + 1), [])
    )
    return (
      <>
        <Button
          title="Begin Sign-in Test"
          onPress={() => {
            navigation.navigate("signIn", { screen: "signInForm" })
          }}
        />
        {focusCount > 1 && <View testID={IS_AT_END_TEST_ID} />}
      </>
    )
  }
})
