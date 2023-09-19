import { createStackNavigator } from "@react-navigation/stack"
import { SignUpParamsList, createSignUpScreens } from "./Navigation"
import { View } from "react-native"
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import { NavigationContainer } from "@react-navigation/native"
import "../../tests/helpers/Matchers"
import { UserHandle } from "@lib/users"
import { fakeTimers } from "../../tests/helpers/Timers"
import { USPhoneNumber } from ".."
import { TestQueryClientProvider } from "../../tests/helpers/ReactQuery"

type TestSignUpParamsList = {
  testEnding: undefined
} & SignUpParamsList

describe("SignUpNavigation tests", () => {
  fakeTimers()
  beforeEach(() => jest.resetAllMocks())

  test("a full valid sign-up flow", async () => {
    createAccount.mockReturnValueOnce(Promise.resolve())

    const generatedUserHandle = UserHandle.parse("bitchelldickle12").handle!
    finishRegisteringAccount.mockResolvedValue({
      userHandle: generatedUserHandle
    })

    checkIfUserHandleTaken.mockResolvedValue(false)
    changeUserHandle.mockReturnValue(Promise.resolve())

    renderSignUpFlow()

    enterName("Bitchell Dickle")
    enterPhoneNumberText("1234567890")
    enterPassword("1234")

    submitCredentials()

    await waitFor(() => expect(verififyCodeForm()).toBeDisplayed())

    enterVerificationCode("123456")
    submitVerificationCode()

    await waitFor(() => expect(changeUserHandleForm()).toBeDisplayed())
    expect(finishRegisteringAccount).toHaveBeenCalledWith(
      USPhoneNumber.parse("1234567890")!,
      "123456"
    )

    replaceUserHandleText(generatedUserHandle.rawValue, "bitchelldickle")
    submitNewUserHandle()

    await waitFor(() => expect(endingView()).toBeDisplayed())
    movePastEnding()

    expect(isAtEnd()).toEqual(true)
  })

  const createAccount = jest.fn()
  const finishRegisteringAccount = jest.fn()
  const changeUserHandle = jest.fn()
  const checkIfUserHandleTaken = jest.fn()

  const renderSignUpFlow = () => {
    const Stack = createStackNavigator<TestSignUpParamsList>()
    const signUpScreens = createSignUpScreens(Stack, {
      createAccount,
      finishRegisteringAccount,
      checkIfUserHandleTaken,
      changeUserHandle
    })
    return render(
      <NavigationContainer>
        <TestQueryClientProvider>
          <Stack.Navigator initialRouteName="signUpCredentialsForm">
            {signUpScreens}
            <Stack.Screen name="testEnding" component={TestEndingScreen} />
          </Stack.Navigator>
        </TestQueryClientProvider>
      </NavigationContainer>
    )
  }

  const enterName = (name: string) => {
    fireEvent.changeText(screen.getByPlaceholderText("Name"), name)
  }

  const enterPhoneNumberText = (text: string) => {
    fireEvent.changeText(
      screen.getByPlaceholderText("Phone number or Email"),
      text
    )
  }

  const enterPassword = (password: string) => {
    fireEvent.changeText(screen.getByPlaceholderText("Password"), password)
  }

  const submitCredentials = () => {
    fireEvent.press(screen.getByText("I'm ready!"))
  }

  const verififyCodeForm = () => screen.queryByText("Verify your Account")

  const enterVerificationCode = (code: string) => {
    fireEvent.changeText(
      screen.getByPlaceholderText("Enter the 6-digit code"),
      code
    )
  }

  const submitVerificationCode = () => {
    fireEvent.press(screen.getByText("Verify Me!"))
  }

  const changeUserHandleForm = () => screen.queryByText("Pick your Username")

  const replaceUserHandleText = (
    originalHandleText: string,
    newHandletext: string
  ) => {
    fireEvent.changeText(screen.getByText(originalHandleText), newHandletext)
  }

  const submitNewUserHandle = () => {
    fireEvent.press(screen.getByText("I like this name!"))
  }

  const endingView = () => screen.queryByText("Welcome to TiF!")

  const movePastEnding = () => {
    fireEvent.press(screen.getByText("Awesome!"))
  }

  const IS_AT_END_TEST_ID = "test-sign-up-flow-end"

  const isAtEnd = () => !!screen.queryByTestId(IS_AT_END_TEST_ID)

  const TestEndingScreen = () => <View testID={IS_AT_END_TEST_ID} />
})
