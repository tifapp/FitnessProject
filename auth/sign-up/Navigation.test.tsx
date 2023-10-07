import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { SignUpParamsList, createSignUpScreens } from "./Navigation"
import { Button, View } from "react-native"
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import { NavigationContainer, useFocusEffect } from "@react-navigation/native"
import "../../tests/helpers/Matchers"
import { UserHandle } from "@lib/users"
import { fakeTimers } from "../../tests/helpers/Timers"
import { TestQueryClientProvider } from "../../tests/helpers/ReactQuery"
import { useCallback, useState } from "react"
import { TiFAPI } from "@api-client/TiFAPI"
import { createTiFAPIFetch } from "@api-client/client"
import { createSignUpEnvironment } from "./Environment"
import { rest } from "msw"
import { uuid } from "@lib/uuid"
import { mswServer } from "../../tests/helpers/msw"
import { captureAlerts } from "../../tests/helpers/Alerts"

type TestSignUpParamsList = {
  test: undefined
} & SignUpParamsList

const TEST_GENERATED_USER_HANDLE = UserHandle.parse("bitchelldic12").handle!

describe("SignUpNavigation tests", () => {
  const cognito = {
    signUp: jest.fn(),
    resendSignUp: jest.fn(),
    confirmSignUp: jest.fn()
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

  afterEach(() => act(() => jest.runAllTimers()))
  fakeTimers()
  beforeEach(() => {
    jest.resetAllMocks()
    mswServer.use(
      rest.post("https://localhost:8080/user", async (_, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({ id: uuid(), handle: TEST_GENERATED_USER_HANDLE.rawValue })
        )
      }),
      rest.get(
        "https://localhost:8080/user/autocomplete",
        async (_, res, ctx) => {
          return res(ctx.status(200), ctx.json({ users: [] }))
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
    cognito.confirmSignUp.mockReturnValue(Promise.resolve("SUCCESS"))
    submitVerificationCode()

    await waitFor(() => expect(changeUserHandleForm()).toBeDisplayed())
    expect(cognito.confirmSignUp).toHaveBeenCalledWith("+11234567890", "123456")
    expect(verifyCodeForm()).not.toBeDisplayed()

    const newHandleText = "bitchelldickle"

    replaceUserHandleText(TEST_GENERATED_USER_HANDLE.rawValue, newHandleText)
    mswServer.use(
      rest.patch("https://localhost:8080/user", async (req, res, ctx) => {
        const body = await req.json()
        if (body.handle !== newHandleText) {
          return res(ctx.status(500))
        }
        return res(ctx.status(204))
      })
    )
    submitNewUserHandle()

    await waitFor(() => expect(endingView()).toBeDisplayed())
    endSignUpTest()

    expect(isAtEnd()).toEqual(true)
  })

  test("get to end of sign-up flow, go back to change username again, finish sign-up flow", async () => {
    mswServer.use(
      rest.patch("https://localhost:8080/user", async (_, res, ctx) => {
        return res(ctx.status(204))
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
    const signUpScreens = createSignUpScreens(Stack, env)
    return render(
      <TestQueryClientProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="test">
            {signUpScreens}
            <Stack.Screen name="test" component={TestScreen} />
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
