import {
  BASE_HEADER_SCREEN_OPTIONS,
  ChevronBackButton,
  XMarkBackButton
} from "@components/Navigation"
import { NavigationContainer, useNavigation } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import {
  CreateAccountUserHandleFormView,
  CreateAccountFormView
} from "@auth/sign-up"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Button, View } from "react-native"
import { useState } from "react"

const SignUpMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Sign Up"
}

export default SignUpMeta

type SignUpStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

export const Basic: SignUpStory = () => (
  <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
        <Stack.Screen name="test" component={TestScreen} />
        <Stack.Screen
          name="signUp"
          options={{ headerLeft: () => <XMarkBackButton />, title: "" }}
          component={CreateAccountFormView}
        />
        <Stack.Screen
          name="changeHandle"
          options={{ headerLeft: () => <ChevronBackButton />, title: "" }}
          component={HandleScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
)

const HandleScreen = () => {
  const [handle, setHandle] = useState("pinaculousprincess69")
  return (
    <CreateAccountUserHandleFormView
      currentHandleText={handle}
      onCurrentHandleTextChanged={setHandle}
      invalidHandleReason="bad-format"
    />
  )
}

const TestScreen = () => {
  const navigation = useNavigation()
  return (
    <View>
      <Button
        title="Create Account Form"
        onPress={() => navigation.navigate("signUp")}
      />
      <Button
        title="Change Handle Form"
        onPress={() => navigation.navigate("changeHandle")}
      />
    </View>
  )
}
