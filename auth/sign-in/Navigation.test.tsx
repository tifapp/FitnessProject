import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import { CognitoSignInAuthenticator } from "./Authenticator"
import { TestQueryClientProvider } from "../../tests/helpers/ReactQuery"
import {
  NavigationContainer,
  NavigatorScreenParams,
  useFocusEffect
} from "@react-navigation/native"
import { SignInParamsList, createSignInScreens } from "./Navigation"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { useState, useCallback } from "react"
import { Button, View } from "react-native"
import { USPhoneNumber } from ".."
import "../../tests/helpers/Matchers"
import { TestCognitoError } from "@auth/CognitoHelpers"

type TestParamsList = {
  test: undefined
  signIn: NavigatorScreenParams<SignInParamsList>
}

describe("SignInNavigation tests", () => {
  const TEST_PASSWORD = "12345678"
  const cognito = {
    signIn: jest.fn(),
    resendSignUp: jest.fn(),
    confirmSignIn: jest.fn()
  }
  const authenticator = new CognitoSignInAuthenticator(cognito)

  beforeEach(() => jest.useFakeTimers())

  test("sign in with correct credentials", async () => {
    renderSignInScreens()
    beginSignInTest()

    enterPhoneNumberText(USPhoneNumber.mock.toString())
    enterPasswordText(TEST_PASSWORD)

    cognito.signIn.mockResolvedValueOnce({})
    submitSignInCredentials()

    await waitFor(() => expect(isAtEnd()).toEqual(true))
  })

  test("sign in, requires sign in verification flow for SMS MFA", async () => {
    renderSignInScreens()
    beginSignInTest()

    enterPhoneNumberText(USPhoneNumber.mock.toString())
    enterPasswordText(TEST_PASSWORD)

    cognito.signIn.mockResolvedValueOnce({ challengeName: "SMS_MFA" })
    submitSignInCredentials()

    await waitFor(() => expect(signInVerificationCodeForm()).toBeDisplayed())
    enterVerificationCode("123456")

    cognito.confirmSignIn.mockResolvedValue({})

    submitVerificationCode()
    await waitFor(() => expect(isAtEnd()).toEqual(true))
  })

  it("should switch over to the sign up flow when sign up verification required", async () => {
    renderSignInScreens()
    beginSignInTest()

    enterPhoneNumberText(USPhoneNumber.mock.toString())
    enterPasswordText(TEST_PASSWORD)

    cognito.signIn.mockRejectedValueOnce(
      new TestCognitoError("UserNotConfirmedException")
    )
    submitSignInCredentials()

    await waitFor(() => {
      expect(signUpVerifyCodeForm(USPhoneNumber.mock)).toBeDisplayed()
    })
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

  const signInVerificationCodeForm = () => {
    return screen.queryByText("Verify your Account")
  }
  const submitVerificationCode = () => {
    fireEvent.press(screen.getByLabelText("Verify me!"))
  }

  const enterVerificationCode = (code: string) => {
    fireEvent.changeText(
      screen.getByPlaceholderText("Enter the 6-digit code"),
      code
    )
  }

  const signUpVerifyCodeForm = (phoneNumber: USPhoneNumber) => {
    return screen.queryByTestId(`sign-up-verify-${phoneNumber}`)
  }

  const renderSignInScreens = () => {
    const Stack = createStackNavigator<TestParamsList>()
    const ModalStack = createStackNavigator<SignInParamsList>()
    const signInScreens = createSignInScreens(ModalStack, authenticator)
    return render(
      <TestQueryClientProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="test">
            <Stack.Screen name="test" component={TestScreen} />
            <Stack.Screen name="signIn">
              {() => (
                <ModalStack.Navigator initialRouteName="signInForm">
                  {signInScreens}
                  <ModalStack.Screen name="signUpVerifyCodeForm">
                    {(props) => (
                      <View
                        testID={`sign-up-verify-${props.route.params.emailOrPhoneNumber}`}
                      />
                    )}
                  </ModalStack.Screen>
                </ModalStack.Navigator>
              )}
            </Stack.Screen>
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
