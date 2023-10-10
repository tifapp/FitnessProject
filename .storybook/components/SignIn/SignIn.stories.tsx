import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { SignInFormView, useSignInForm } from "@auth/sign-in"
import { createStackNavigator } from "@react-navigation/stack"
import { NavigationContainer } from "@react-navigation/native"
import {
  BASE_HEADER_SCREEN_OPTIONS,
  XMarkBackButton
} from "@components/Navigation"

const SignInMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Sign In"
}

export default SignInMeta

type SignInStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

export const Basic: SignInStory = () => (
  <TiFQueryClientProvider>
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={BASE_HEADER_SCREEN_OPTIONS}>
          <Stack.Screen
            name="test"
            options={{ title: "", headerLeft: XMarkBackButton }}
            component={TestScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  </TiFQueryClientProvider>
)

const TestScreen = () => {
  const form = useSignInForm({
    signIn: async () => {
      throw new Error("Dead")
    },
    onSuccess: () => {}
  })
  return <SignInFormView {...form} onForgotPasswordTapped={() => {}} />
}
