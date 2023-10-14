import { Password } from "@auth/Password"
import { NavigationContainer, useFocusEffect } from "@react-navigation/native"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import { useCallback, useState } from "react"
import { View } from "react-native"
import { Button } from "react-native-elements"
import { USPhoneNumber } from ".."
import "../../tests/helpers/Matchers"
import { TestQueryClientProvider } from "../../tests/helpers/ReactQuery"
import { fakeTimers } from "../../tests/helpers/Timers"
import {
  ForgotPasswordParamsList,
  createForgotPasswordScreens
} from "./ForgotPasswordNavigation"

const TEST_GENERATED_PASSWORD = Password.validate("Fergus#12")!

type TestForgotPasswordParamsList = {
  test: undefined
} & ForgotPasswordParamsList

describe("Forgot Password Navigation tests", () => {
  afterEach(() => act(() => jest.runAllTimers()))
  fakeTimers()
  beforeEach(() => jest.resetAllMocks())

  test("valid navigation flow", async () => {
    // Test screen to get into actual flow
    const testPhoneNumber = "8882332121"
    initiateForgotPassword.mockReturnValueOnce(Promise.resolve())

    submitResettedPassword.mockResolvedValueOnce("valid")

    renderForgotPasswordNavigation()

    beginForgotPasswordTest()

    enterPhoneNumberText(testPhoneNumber)
    expect(checkText(testPhoneNumber)).not.toBeNull()

    submitCredentials()

    await waitFor(() => expect(verifyCodeForm()).toBeDisplayed())
    expect(credentialsForm()).not.toBeDisplayed()

    enterVerificationCode("123456")
    expect(checkText("123456")).not.toBeNull()

    submitVerificationCode()

    await waitFor(() => expect(resetPasswordForm()).toBeDisplayed())
    expect(verifyCodeForm()).not.toBeDisplayed()

    enterNewPassword("elon@musK3")
    submitNewPassword()

    await waitFor(() => expect(isAtEnd()).toEqual(true))
  })

  it("has a full navigation flow: forgot -> verify -> reset -> verify", async () => {
    // Test screen to get into actual flow
    const testPhoneNumber = "8882332121"
    initiateForgotPassword.mockReturnValueOnce(Promise.resolve())

    submitResettedPassword
      .mockResolvedValueOnce("invalid-verification-code")
      .mockResolvedValueOnce("valid")

    renderForgotPasswordNavigation()

    beginForgotPasswordTest()

    enterPhoneNumberText(testPhoneNumber)

    expect(checkText(testPhoneNumber)).not.toBeNull()

    submitCredentials()

    await waitFor(() => expect(verifyCodeForm()).toBeDisplayed())
    expect(credentialsForm()).not.toBeDisplayed()

    enterVerificationCode("123456")
    expect(checkText("123456")).not.toBeNull()

    submitVerificationCode()

    await waitFor(() => expect(resetPasswordForm()).toBeDisplayed())
    expect(verifyCodeForm()).not.toBeDisplayed()

    enterNewPassword("elon@musK3")

    submitNewPassword()

    await waitFor(() => expect(verifyCodeForm()).toBeDisplayed())
    expect(resetPasswordForm()).not.toBeDisplayed()

    enterVerificationCode("543423")
    expect(checkText("543423")).not.toBeNull()

    submitVerificationCode()

    await waitFor(() => expect(resetPasswordForm()).toBeDisplayed())
    expect(verifyCodeForm()).not.toBeDisplayed()

    submitNewPassword()

    await waitFor(() =>
      expect(submitResettedPassword).toHaveBeenCalledWith(
        USPhoneNumber.parse(testPhoneNumber),
        "543423",
        Password.validate("elon@musK3")
      )
    )
  })
})

const initiateForgotPassword = jest.fn()
const submitResettedPassword = jest.fn()

const renderForgotPasswordNavigation = () => {
  const Stack = createStackNavigator<TestForgotPasswordParamsList>()
  const signUpScreens = createForgotPasswordScreens(Stack, {
    initiateForgotPassword,
    submitResettedPassword
  })
  return render(
    <TestQueryClientProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="test"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="test" component={TestScreen} />
          {signUpScreens}
        </Stack.Navigator>
      </NavigationContainer>
    </TestQueryClientProvider>
  )
}

const IS_AT_END_TEST_ID = "test-sign-up-flow-end"

const isAtEnd = () => !!screen.queryByTestId(IS_AT_END_TEST_ID)

const beginForgotPasswordTest = () =>
  fireEvent.press(screen.getByText("Begin Forgot Password Test"))

const credentialsForm = () => screen.queryByText("Forgot Your Password?")

const enterPhoneNumberText = (text: string) => {
  fireEvent.changeText(
    screen.getByPlaceholderText("Enter Phone # / Email"),
    text
  )
}

const checkText = (text: string) => {
  screen.queryByText(text)
}

const submitCredentials = () => {
  fireEvent.press(screen.getByLabelText("Reset Password"))
}

const verifyCodeForm = () => screen.queryByText("Verify your Account")

const enterVerificationCode = (code: string) => {
  fireEvent.changeText(
    screen.getByPlaceholderText("Enter the 6-digit code"),
    code
  )
}

const submitVerificationCode = () => {
  const button = screen.getByLabelText("Verify me!")
  // NB: For some reason, using fireEvent will sometimes just hang and not press the button, even though
  // it knows it's there so instead we'll just have to invoke the press manually...
  act(() => button.props.onClick())
}

const resetPasswordForm = () => screen.queryByText("Reset Password")

const enterNewPassword = (newPass: string) => {
  fireEvent.changeText(screen.getByPlaceholderText("New Password"), newPass)
}

const submitNewPassword = () => {
  const button = screen.getByLabelText("Change Password")
  act(() => button.props.onClick())
}

const TestScreen = ({
  navigation
}: StackScreenProps<TestForgotPasswordParamsList, "test">) => {
  const [focusCount, setFocusCount] = useState(0)
  useFocusEffect(
    useCallback(() => setFocusCount((focusCount) => focusCount + 1), [])
  )
  return (
    <>
      <Button
        title="Begin Forgot Password Test"
        onPress={() => navigation.navigate("forgotPassword")}
      />

      {focusCount > 1 && <View testID={IS_AT_END_TEST_ID} />}
    </>
  )
}
