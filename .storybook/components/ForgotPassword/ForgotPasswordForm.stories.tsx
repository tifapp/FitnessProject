import { Password } from "@auth/Password"
import {
  ForgotPasswordParamsList,
  createForgotPasswordScreens
} from "@auth/forgot-password/ForgotPasswordNavigation"
import { ResetPasswordResult } from "@auth/forgot-password/ResetPasswordForm"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { delayData } from "@lib/DelayData"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
const ForgotPasswordMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Forgot Password"
}

export default ForgotPasswordMeta

type ForgotPasswordStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator<ForgotPasswordParamsList>()

const signUpScreens = createForgotPasswordScreens(Stack, {
  initiateForgotPassword: async () =>
    await delayData<void>(console.log("Test Forgot Password Screen"), 500),
  initiateResetPassword: async () =>
    await delayData<ResetPasswordResult>("valid", 500),
  finishVerifyingAccount: async () => {
    return Password.validate("elon@Smusk")!
  }
})

export const Basic: ForgotPasswordStory = () => (
  <TiFQueryClientProvider>
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="forgotPassword">
          {signUpScreens}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  </TiFQueryClientProvider>
)

// const TestScreen = () => {
//   const navigation: NavigationProp<ParamListBase> = useNavigation()
//   return (
//     <View>
//       <Button
//         title="Email Entry"
//         onPress={() => navigation.navigate("ForgotPasswordScreen")}
//       />
//       <Button
//         title="Verify Code Form"
//         onPress={() => navigation.navigate("VerifyCodeScreen")}
//       />
//       <Button
//         title="Reset Password"
//         onPress={() => navigation.navigate("ResetPasswordScreen")}
//       />
//     </View>
//   )
// }
