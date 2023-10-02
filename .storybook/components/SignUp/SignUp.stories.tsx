import { AuthShadedEmailPhoneTextFieldView } from "@auth/AuthTextFields"
import { useEmailPhoneTextState } from "@auth/UseEmailPhoneText"
import {
  CreateAccountCredentialsFormView,
  CreateAccountEndingView,
  CreateAccountUserHandleFormView
} from "@auth/sign-up"
import {
  BASE_HEADER_SCREEN_OPTIONS,
  ChevronBackButton,
  XMarkBackButton
} from "@components/Navigation"
import { AppStyles } from "@lib/AppColorStyle"
import {
  NavigationContainer,
  NavigationProp,
  ParamListBase,
  useNavigation
} from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { useState } from "react"
import { Button } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"

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
          component={CreateAccountCredentialsFormView}
        />
        <Stack.Screen
          name="changeHandle"
          options={{ headerLeft: () => <ChevronBackButton />, title: "" }}
          component={HandleScreen}
        />
        <Stack.Screen
          name="welcome"
          options={{ headerLeft: () => <ChevronBackButton />, title: "" }}
          component={CreateAccountEndingView}
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
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  const { text, activeTextType, onTextChanged, onActiveTextTypeToggled } =
    useEmailPhoneTextState("phone")
  return (
    <ScrollView>
      <Button
        title="Create Account Form"
        onPress={() => navigation.navigate("signUp")}
      />
      <Button
        title="Change Handle Form"
        onPress={() => navigation.navigate("changeHandle")}
      />
      <Button title="Welcome" onPress={() => navigation.navigate("welcome")} />
      <AuthShadedEmailPhoneTextFieldView
        iconBackgroundColor={AppStyles.darkColor}
        value={text}
        activeTextType={activeTextType}
        onChangeText={onTextChanged}
        onActiveTextTypeToggled={onActiveTextTypeToggled}
        style={{ marginTop: 48, paddingHorizontal: 16 }}
      />
    </ScrollView>
  )
}
