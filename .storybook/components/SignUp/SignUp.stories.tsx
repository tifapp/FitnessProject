import {
  BASE_HEADER_SCREEN_OPTIONS,
  ChevronBackButton,
  XMarkBackButton
} from "@components/Navigation"
import { NavigationContainer, useNavigation } from "@react-navigation/native"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { createSignUpScreens, SignUpParamsList } from "@auth/sign-up"
import { useEmailPhoneTextState } from "@auth/UseEmailPhoneText"
import { AuthShadedEmailPhoneTextFieldView } from "@auth/AuthTextFields"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Button, View } from "react-native"
import { UserHandle } from "@lib/users"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { delayData, sleep } from "@lib/DelayData"
import { ScrollView } from "react-native-gesture-handler"
import { AppStyles } from "@lib/AppColorStyle"

const SignUpMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Sign Up"
}

export default SignUpMeta

type SignUpStory = ComponentStory<typeof SettingsScreen>

type ParamsList = SignUpParamsList & { test: {} }

const Stack = createStackNavigator<ParamsList>()

const screens = createSignUpScreens(Stack, {
  createAccount: async () => {},
  finishRegisteringAccount: async () => {
    return { userHandle: UserHandle.parse("elonmusk").handle! }
  },
  changeUserHandle: async () => {},
  checkIfUserHandleTaken: async () => false
})

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

const TestScreen = ({ navigation }: StackScreenProps<ParamsList, "test">) => {
  const { text, activeTextType, onTextChanged, onActiveTextTypeToggled } =
    useEmailPhoneTextState("phone")
  return (
    <ScrollView>
      <Button
        title="Do sign up flow"
        onPress={() => {
          navigation.navigate("signUp", { screen: "signUpCredentialsForm" })
        }}
      />
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
