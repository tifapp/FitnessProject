import { TiFAPI, createTiFAPIFetch } from "@api-client"
import { UserHandle } from "@content-parsing"
import { uuidString } from "@lib/utils/UUID"
import {
  NavigationContainer,
  NavigatorScreenParams,
  useFocusEffect
} from "@react-navigation/native"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { captureAlerts } from "@test-helpers/Alerts"
import "@test-helpers/Matchers"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { withAnimatedTimeTravelEnabled } from "@test-helpers/Timers"
import { mswServer } from "@test-helpers/msw"
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import { HttpResponse, http } from "msw"
import { useCallback, useState } from "react"
import { Button, View } from "react-native"
import { createSignUpEnvironment } from "./Environment"
import { SignUpParamsList, createSignUpScreens } from "./Navigation"

type TestSignUpParamsList = {
  test: undefined
  signUp: NavigatorScreenParams<SignUpParamsList>
}

const TEST_GENERATED_USER_HANDLE = UserHandle.parse("bitchelldic12").handle!

describe("SignUpNavigation tests", () => {
  const cognito = {
    signUp: jest.fn(),
    resendSignUp: jest.fn(),
    confirmSignUpWithAutoSignIn: jest.fn()
  }
  const env = createSignUpEnvironment(
    cognito,
    new TiFAPI(
      createTiFAPIFetch(
        new URL("https://localhost:8080"),
        async () => "I am a jwt"
      )
    )
  )

  withAnimatedTimeTravelEnabled()

  beforeEach(() => {
    jest.resetAllMocks()
    mswServer.use(
      http.post("https://localhost:8080/user", async () => {
        return new HttpResponse(JSON.stringify({
          id: uuidString(),
          handle: TEST_GENERATED_USER_HANDLE.rawValue
        }), {
          status: 201,
          headers: {
            "Content-Type": "application/json"
          }
        })
      }),
      http.get(
        "https://localhost:8080/user/autocomplete",
        async () => {
          return new HttpResponse(JSON.stringify({ users: [] }), {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          })
        }
      )
    )
  })

  test("a full valid sign-up flow", async () => {
    renderSignUpFlow()

    startSignUpTest()

    enterName("Bitchell Dickle")
    enterPhoneNumberText("1234567890")
    enterPassword("Abc123{}op")

    cognito.signUp.mockReturnValue(Promise.resolve({}))
    submitCredentials()

    await waitFor(() => expect(verifyCodeForm()).toBeDisplayed())
    expect(credentialsForm()).not.toBeDisplayed()

    enterVerificationCode("123456")
    cognito.confirmSignUpWithAutoSignIn.mockReturnValue(
      Promise.resolve("SUCCESS")
    )
    submitVerificationCode()

    await waitFor(() => expect(changeUserHandleForm()).toBeDisplayed())
    expect(cognito.confirmSignUpWithAutoSignIn).toHaveBeenCalledWith(
      "+11234567890",
      "123456"
    )
    expect(verifyCodeForm()).not.toBeDisplayed()

    const newHandleText = "bitchelldickle"

    replaceUserHandleText(TEST_GENERATED_USER_HANDLE.rawValue, newHandleText)
    mswServer.use(
      http.patch("https://localhost:8080/user/self", async ({ request }) => {
        const body: any = await request.json()
        if (body?.handle !== newHandleText) {
          return new HttpResponse(null, {
            status: 500
          })
        }
        return new HttpResponse(null, {
          status: 204
        })
      })
    )
    submitNewUserHandle()

    await waitFor(() => expect(endingView()).toBeDisplayed())
    endSignUpTest()

    await waitFor(() => expect(isAtEnd()).toEqual(true))
  })

  test("get to end of sign-up flow, go back to change username again, finish sign-up flow", async () => {
    mswServer.use(
      http.patch("https://localhost:8080/user/self", async () => {
        return new HttpResponse(null, {
          status: 204
        })
      })
    )

    renderSignUpFlow()

    startSignUpTestAtUserHandleStage(TEST_GENERATED_USER_HANDLE)

    replaceUserHandleText(TEST_GENERATED_USER_HANDLE.rawValue, "bitchelldickle")
    submitNewUserHandle()

    await waitFor(() => expect(endingView()).toBeDisplayed())
    goBack()
    expect(endingView()).not.toBeDisplayed()

    replaceUserHandleText("bitchelldickle", "bic")
    submitNewUserHandle()

    await waitFor(() => expect(endingView()).toBeDisplayed())

    endSignUpTest()

    expect(isAtEnd()).toEqual(true)
  })

  test("leave sign-up flow warning alert flow", async () => {
    renderSignUpFlow()

    startSignUpTest()

    attemptToExit()
    expect(alertPresentationSpy).toHaveBeenCalled()

    await confirmExit()

    expect(isAtEnd()).toEqual(true)
  })

  const renderSignUpFlow = () => {
    const Stack = createStackNavigator<TestSignUpParamsList>()
    const ModalStack = createStackNavigator<SignUpParamsList>()
    const signUpScreens = createSignUpScreens(ModalStack, env)
    return render(
      <TestQueryClientProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="test">
            <Stack.Screen name="test" component={TestScreen} />
            <Stack.Screen name="signUp">
              {() => (
                <ModalStack.Navigator initialRouteName="signUpCredentialsForm">
                  {signUpScreens}
                </ModalStack.Navigator>
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </TestQueryClientProvider>
    )
  }

  const { alertPresentationSpy, tapAlertButton } = captureAlerts()

  const attemptToExit = () => {
    fireEvent.press(screen.getByLabelText("Go Back"))
  }

  const confirmExit = async () => {
    await tapAlertButton("Cancel Sign Up")
  }

  const credentialsForm = () => {
    return screen.queryByText("Create your Account")
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
    fireEvent.press(screen.getByLabelText("I'm ready!"))
  }

  const verifyCodeForm = () => screen.queryByText("Verify your Account")

  const enterVerificationCode = (code: string) => {
    fireEvent.changeText(
      screen.getByPlaceholderText("Enter the 6-digit code"),
      code
    )
  }

  const submitVerificationCode = () => {
    fireEvent.press(screen.getByLabelText("Verify me!"))
  }

  const changeUserHandleForm = () => screen.queryByText("Choose your Username")

  const replaceUserHandleText = (
    originalHandleText: string,
    newHandletext: string
  ) => {
    fireEvent.changeText(screen.getByTestId(originalHandleText), newHandletext)
  }

  const submitNewUserHandle = () => {
    const button = screen.getByLabelText("I like this name!")
    // NB: For some reason, using fireEvent will sometimes just hang and not press the button, even though
    // it knows it's there so instead we'll just have to invoke the press manually...
    act(() => button.props.onClick())
  }

  const endingView = () => screen.queryByText("Welcome to tiF!")

  const endSignUpTest = () => {
    fireEvent.press(screen.getByText("Awesome!"))
  }

  const startSignUpTest = () => {
    fireEvent.press(screen.getByText("Begin Sign-up Test"))
  }

  let initialHandle: UserHandle | undefined
  const startSignUpTestAtUserHandleStage = (handle: UserHandle) => {
    initialHandle = handle
    fireEvent.press(screen.getByText("Begin Sign-up Test at Handle Stage"))
  }

  const IS_AT_END_TEST_ID = "test-sign-up-flow-end"

  const isAtEnd = () => !!screen.queryByTestId(IS_AT_END_TEST_ID)

  const goBack = () => {
    fireEvent.press(screen.getByLabelText("Go Back"))
  }

  const TestScreen = ({
    navigation
  }: StackScreenProps<TestSignUpParamsList, "test">) => {
    const [focusCount, setFocusCount] = useState(0)
    useFocusEffect(
      useCallback(() => setFocusCount((focusCount) => focusCount + 1), [])
    )
    return (
      <>
        <Button
          title="Begin Sign-up Test"
          onPress={() =>
            navigation.navigate("signUp", { screen: "signUpCredentialsForm" })
          }
        />
        <Button
          title="Begin Sign-up Test at Handle Stage"
          onPress={() =>
            navigation.navigate("signUp", {
              screen: "signUpChangeUserHandleForm",
              params: { initialHandle: initialHandle! }
            })
          }
        />
        {focusCount > 1 && <View testID={IS_AT_END_TEST_ID} />}
      </>
    )
  }
})
