import {
  ForgotPasswordFormView,
  ForgotPasswordResult,
  useForgotPasswordForm
} from "@auth/forgot-password/ForgotPasswordForm"
import {
  ResetPasswordFormView,
  ResetPasswordResult,
  useResetPasswordForm
} from "@auth/forgot-password/ResetPasswordForm"
import { CreateAccountVerifyCodeView } from "@auth/sign-up"
import {
  BASE_HEADER_SCREEN_OPTIONS,
  ChevronBackButton,
  XMarkBackButton
} from "@components/Navigation"
import { delayData } from "@lib/DelayData"
import { NavigationContainer, useNavigation } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import {
  ForgotPasswordScreenProps,
  ResetPasswordScreenProps
} from "@screens/ProfileScreen/Navigation/ProfileScreensNavigation"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { Button, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

const ForgotPasswordMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Forgot Password"
}

export default ForgotPasswordMeta

type ForgotPasswordStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
  const forgotPassword = useForgotPasswordForm({
    onSubmitted: async () => await delayData<ForgotPasswordResult>("valid"),
    onSuccess: () => navigation.goBack()
  })
  return <ForgotPasswordFormView {...forgotPassword} />
}

const ResetPasswordScreen = ({ navigation }: ResetPasswordScreenProps) => {
  const resetPassword = useResetPasswordForm({
    onSubmitted: async () => await delayData<ResetPasswordResult>("valid"),
    onSuccess: () => navigation.goBack()
  })
  return <ResetPasswordFormView {...resetPassword} />
}

const VerifyCodeScreen = ({ navigation }: ResetPasswordScreenProps) => {
  return <CreateAccountVerifyCodeView phoneNumber={"432-3321"} />
}

export const Basic: ForgotPasswordStory = () => (
  <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
        <Stack.Screen name="test2" component={TestScreen} />
        <Stack.Screen
          name="emailEntry"
          options={{ headerLeft: () => <XMarkBackButton />, title: "" }}
          component={ForgotPasswordScreen}
        />
        <Stack.Screen
          name="verifyCode"
          options={{ headerLeft: () => <ChevronBackButton />, title: "" }}
          component={VerifyCodeScreen}
        />
        <Stack.Screen
          name="resetPassword"
          options={{ headerLeft: () => <ChevronBackButton />, title: "" }}
          component={ResetPasswordScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
)

const TestScreen = () => {
  const navigation = useNavigation()
  return (
    <View>
      <Button
        title="Email Entry"
        onPress={() => navigation.navigate("emailEntry")}
      />
      <Button
        title="Verify Code Form"
        onPress={() => navigation.navigate("verifyCode")}
      />
      <Button
        title="Reset Password"
        onPress={() => navigation.navigate("resetPassword")}
      />
    </View>
  )
}
