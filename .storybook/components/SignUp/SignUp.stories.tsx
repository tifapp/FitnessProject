import { TiFAPI, createAWSTiFAPIFetch } from "@api-client"
import { Auth } from "@aws-amplify/auth"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { NavigationContainer } from "@react-navigation/native"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import {
  createSignUpEnvironment,
  createSignUpScreens,
  SignUpParamsList,
  cognitoConfirmSignUpWithAutoSignIn
} from "@auth/sign-up"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Button } from "react-native"
import { ScrollView } from "react-native-gesture-handler"

const SignUpMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Sign Up"
}

export default SignUpMeta

type SignUpStory = ComponentStory<typeof SettingsScreen>

type ParamsList = SignUpParamsList & { test: {} }

const Stack = createStackNavigator<ParamsList>()

const tiFAPI = new TiFAPI(
  createAWSTiFAPIFetch(
    new URL("https://623qsegfb9.execute-api.us-west-2.amazonaws.com/prod/")
  )
)

const screens = createSignUpScreens(
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

export const Basic: SignUpStory = () => (
  <TiFQueryClientProvider>
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
          <Stack.Screen name="test" component={TestScreen} />
          {screens}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  </TiFQueryClientProvider>
)

const TestScreen = ({ navigation }: StackScreenProps<ParamsList, "test">) => (
  <ScrollView>
    <Button
      title="Do sign up flow"
      onPress={() => navigation.navigate("signUpCredentialsForm")}
    />
  </ScrollView>
)
