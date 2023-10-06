import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native"
import "../../tests/helpers/Matchers"
import { TestQueryClientProvider } from "../../tests/helpers/ReactQuery"
import { fakeTimers } from "../../tests/helpers/Timers"
import {
  ForgotPasswordParamsList,
  createForgotPasswordScreens
} from "./ForgotPasswordNavigation"

type TestForgotPasswordParamsList = {
  test: undefined
} & ForgotPasswordParamsList

describe("Forgot Password Flow tests", () => {
  afterEach(() => act(() => jest.runAllTimers()))
  fakeTimers()
  beforeEach(() => jest.resetAllMocks())

  it("starts with forgot password, has a success, goes to verify code screen ", async () => {
    // Test screen to get into actual flow
    initiateForgotPassword.mockReturnValueOnce(Promise.resolve())

    renderForgotPasswordFlow()

    enterEmailText("8883331777")

    submitCredentials()

    await waitFor(() => expect(verifyCodeForm()).toBeDisplayed())
    expect(credentialsForm()).not.toBeDisplayed()
  })
})

const initiateForgotPassword = jest.fn()
const initiateResetPassword = jest.fn()
const finishRegisteringAccount = jest.fn()

const renderForgotPasswordFlow = () => {
  const Stack = createStackNavigator<TestForgotPasswordParamsList>()
  const signUpScreens = createForgotPasswordScreens(Stack, {
    initiateForgotPassword,
    initiateResetPassword,
    finishRegisteringAccount
  })
  return render(
    <TestQueryClientProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="forgotPassword">
          {signUpScreens}
        </Stack.Navigator>
      </NavigationContainer>
    </TestQueryClientProvider>
  )
}

const credentialsForm = () => {
  return screen.queryByText("Forgot your Password?")
}

// const startForgotPasswordTest = () => {
//   fireEvent.press(screen.getByText("Begin Sign-up Test"))
// }

const enterEmailText = (text: string) => {
  fireEvent.changeText(
    screen.getByPlaceholderText("Enter Phone # / Email"),
    text
  )
}

const submitCredentials = () => {
  fireEvent.press(screen.getByLabelText("Reset Password"))
}

const verifyCodeForm = () => screen.queryByText("Verify your Account")

const IS_AT_END_TEST_ID = "test-sign-up-flow-end"

// const TestScreen = ({
//   navigation
// }: StackScreenProps<TestForgotPasswordParamsList, "test">) => {
//   const [focusCount, setFocusCount] = useState(0)
//   useFocusEffect(
//     useCallback(() => setFocusCount((focusCount) => focusCount + 1), [])
//   )
//   return (
//     <>
//       <Button
//         title="Begin Sign-up Test"
//         onPress={() => navigation.navigate({ key: "forgotPassword" })}
//       />

//       {focusCount > 1 && <View testID={IS_AT_END_TEST_ID} />}
//     </>
//   )
// }
