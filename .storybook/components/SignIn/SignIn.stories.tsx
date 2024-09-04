import { StoryMeta } from ".storybook/HelperTypes"
import { createForgotPasswordEnvironment } from "@auth-boundary/forgot-password"
import { CognitoSignInAuthenticator } from "@auth-boundary/sign-in"
import {
  cognitoConfirmSignUpWithAutoSignIn,
  createSignUpEnvironment
} from "@auth-boundary/sign-up"
import { Auth } from "@aws-amplify/auth"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { createForgotPasswordScreens } from "@core-root/navigation/auth/ForgotPassword"
import {
  SignInParamsList,
  createSignInScreens
} from "@core-root/navigation/auth/SignIn"
import { createSignUpScreens } from "@core-root/navigation/auth/SignUp"
import { API_URL } from "@env"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { awsTiFAPITransport } from "@lib/TiFAPI"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { ComponentStory } from "@storybook/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TiFAPI } from "TiFShared/api"

const SignInMeta: StoryMeta = {
  title: "Sign In"
}

export default SignInMeta

type SignInStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator<SignInParamsList>()

const tiFAPI = new TiFAPI(awsTiFAPITransport(new URL(API_URL)))

const authenticator = new CognitoSignInAuthenticator()
const signInScreens = createSignInScreens(Stack, authenticator)
const signUpScreens = createSignUpScreens(
  Stack,
  createSignUpEnvironment(
    {
      signUp: async (request) => await Auth.signUp(request),
      resendSignUp: async (username: string) => {
        await Auth.resendSignUp(username)
      },
      confirmSignUpWithAutoSignIn: cognitoConfirmSignUpWithAutoSignIn
    },
    tiFAPI
  )
)
const forgotPasswordScreens = createForgotPasswordScreens(
  Stack,
  createForgotPasswordEnvironment(Auth)
)

export const Basic: SignInStory = () => (
  <TiFQueryClientProvider>
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={BASE_HEADER_SCREEN_OPTIONS}
          initialRouteName="signInForm"
        >
          {signInScreens}
          {signUpScreens}
          {forgotPasswordScreens}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  </TiFQueryClientProvider>
)
