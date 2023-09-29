import { EmailAddress } from "@auth/Email"
import {
  AuthVerificationCodeFormView,
  useAuthVerificationCodeForm
} from "@auth/VerifyCode"
import {
  ForgotPasswordFormView,
  useForgotPasswordForm
} from "@auth/forgot-password/ForgotPasswordForm"
import {
  ResetPasswordFormView,
  ResetPasswordResult,
  useResetPasswordForm
} from "@auth/forgot-password/ResetPasswordForm"
import {
  BASE_HEADER_SCREEN_OPTIONS,
  ChevronBackButton,
  XMarkBackButton
} from "@components/Navigation"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { delayData } from "@lib/DelayData"
import { NavigationContainer, useNavigation } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import {
  ForgotPasswordScreenProps,
  ResetPasswordScreenProps
} from "@screens/ProfileScreen/Navigation/SignInScreensNavigation"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { Button, View } from "react-native"
import { RootSiblingParent } from "react-native-root-siblings"
import { SafeAreaProvider } from "react-native-safe-area-context"

const ForgotPasswordMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Forgot Password"
}

export default ForgotPasswordMeta

type ForgotPasswordStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
  const forgotPassword = useForgotPasswordForm({
    initiateForgotPassword: async () =>
      await delayData<void>(console.log("Test Forgot Password Screen")),
    onSuccess: () => navigation.navigate("VerifyCodeScreen")
  })
  return <ForgotPasswordFormView {...forgotPassword} />
}

const VerifyEmailScreen = ({ navigation }) => {
  const email = EmailAddress.parse("peacock69@gmail.com")!
  const form = useAuthVerificationCodeForm({
    submitCode: async () => await delayData(true, 7000),
    resendCode: async () => await delayData(undefined, 1000),
    onSuccess: () => navigation.navigate("ResetPasswordScreen")
  })
  console.log("Code resend status", form.resendCodeStatus)
  return (
    <AuthVerificationCodeFormView
      {...form}
      codeReceiverName={email.formattedForPrivacy}
    />
  )
}

const ResetPasswordScreen = ({ navigation }: ResetPasswordScreenProps) => {
  const resetPassword = useResetPasswordForm({
    initiateResetPassword: async () =>
      await delayData<ResetPasswordResult>("valid"),
    onSuccess: () => navigation.goBack()
  })
  return <ResetPasswordFormView {...resetPassword} />
}

export const Basic: ForgotPasswordStory = () => (
  <RootSiblingParent>
    <TiFQueryClientProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
            <Stack.Screen name="test2" component={TestScreen} />
            <Stack.Screen
              name="ForgotPasswordScreen"
              options={{ headerLeft: () => <XMarkBackButton />, title: "" }}
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="VerifyCodeScreen"
              options={{ headerLeft: () => <ChevronBackButton />, title: "" }}
              component={VerifyEmailScreen}
            />
            <Stack.Screen
              name="ResetPasswordScreen"
              options={{ headerLeft: () => <ChevronBackButton />, title: "" }}
              component={ResetPasswordScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </TiFQueryClientProvider>
  </RootSiblingParent>
)

const TestScreen = () => {
  const navigation = useNavigation()
  return (
    <View>
      <Button
        title="Email Entry"
        onPress={() => navigation.navigate("ForgotPasswordScreen")}
      />
      <Button
        title="Verify Code Form"
        onPress={() => navigation.navigate("VerifyCodeScreen")}
      />
      <Button
        title="Reset Password"
        onPress={() => navigation.navigate("ResetPasswordScreen")}
      />
    </View>
  )
}
