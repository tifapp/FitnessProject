import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import {
  CognitoSignInAuthenticator,
  SignInParamsList,
  createSignInScreens
} from "@auth/sign-in"
import { createStackNavigator } from "@react-navigation/stack"
import { NavigationContainer } from "@react-navigation/native"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import {
  SignUpEnvironment,
  cognitoConfirmSignUpWithAutoSignIn,
  createSignUpEnvironment,
  createSignUpScreens
} from "@auth/sign-up"
import { createForgotPasswordEnvironment } from "@auth/forgot-password/Environment"
import { createForgotPasswordScreens } from "@auth/forgot-password"
import { Auth } from "@aws-amplify/auth"
import { TiFAPI, createAWSTiFAPIFetch } from "@api-client"

const SignInMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Sign In"
}

export default SignInMeta

type SignInStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator<SignInParamsList>()

const tiFAPI = new TiFAPI(
  createAWSTiFAPIFetch(
    new URL("https://623qsegfb9.execute-api.us-west-2.amazonaws.com/staging/")
  )
)

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
