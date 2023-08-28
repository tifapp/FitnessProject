import {
  BASE_HEADER_SCREEN_OPTIONS,
  XMarkBackButton
} from "@components/Navigation"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { CreateAccountView } from "@auth/sign-up"

const SignUpMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Sign Up"
}

export default SignUpMeta

type SignUpStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

export const Basic: SignUpStory = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
      <Stack.Screen
        name="Sign Up"
        options={{ headerLeft: () => <XMarkBackButton /> }}
        component={CreateAccountView}
      />
    </Stack.Navigator>
  </NavigationContainer>
)
