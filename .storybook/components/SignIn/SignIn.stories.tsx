import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import {
  CognitoSignInAuthenticator,
  SignInParamsList,
  createSignInScreens
} from "@auth/sign-in"
import { createStackNavigator } from "@react-navigation/stack"
import { NavigationContainer } from "@react-navigation/native"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { SignUpEnvironment, createSignUpScreens } from "@auth/sign-up"
import { ForgotPasswordEnvironment } from "@auth/forgot-password/Environment"
import { createForgotPasswordScreens } from "@auth/forgot-password"

const SignInMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Sign In"
}

export default SignInMeta

type SignInStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator<SignInParamsList>()

const authenticator = new CognitoSignInAuthenticator()
const signInScreens = createSignInScreens(Stack, authenticator)
const signUpScreens = createSignUpScreens(Stack, {} as any as SignUpEnvironment)
const forgotPasswordScreens = createForgotPasswordScreens(
  Stack,
  {} as any as ForgotPasswordEnvironment
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
