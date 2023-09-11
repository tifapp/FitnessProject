import {
  BASE_HEADER_SCREEN_OPTIONS,
  ChevronBackButton
} from "@components/Navigation"
import { NavigationContainer, useNavigation } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import {
  AuthVerificationCodeFormView,
  EmailAddress,
  USPhoneNumber,
  useAuthVerificationCodeForm
} from "@auth/index"
import { RootSiblingParent } from "react-native-root-siblings"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Button, View } from "react-native"
import React, { useState } from "react"
import { delayData } from "@lib/DelayData"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"

const VerifyCodeMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Verifcation Code"
}

export default VerifyCodeMeta

type VerifyCodeStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

export const Basic: VerifyCodeStory = () => (
  <RootSiblingParent>
    <TiFQueryClientProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
            <Stack.Screen name="test" component={TestScreen} />
            <Stack.Screen
              name="email"
              options={{ headerLeft: () => <ChevronBackButton />, title: "" }}
              component={EmailScreen}
            />
            <Stack.Screen
              name="phoneNumber"
              options={{ headerLeft: () => <ChevronBackButton />, title: "" }}
              component={PhoneNumberScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </TiFQueryClientProvider>
  </RootSiblingParent>
)

const EmailScreen = () => {
  const email = EmailAddress.parse("peacock69@gmail.com")!
  const form = useAuthVerificationCodeForm({
    checkCode: async () => await delayData(true, 1500),
    resendCode: async () => await delayData(undefined, 1000),
    onSuccess: () => console.log("success")
  })
  console.log("Code resend status", form.resendCodeStatus)
  return (
    <AuthVerificationCodeFormView
      {...form}
      codeReceiverName={email.formattedForPrivacy}
    />
  )
}

const PhoneNumberScreen = () => {
  const phoneNumber = USPhoneNumber.parse("1234567890")!
  const form = useAuthVerificationCodeForm({
    checkCode: async () => await delayData(false, 1500),
    resendCode: async () => {
      throw new Error("Lol")
    },
    onSuccess: () => console.log("success")
  })
  return (
    <AuthVerificationCodeFormView
      {...form}
      codeReceiverName={phoneNumber.formattedForPrivacy}
    />
  )
}

const TestScreen = () => {
  const navigation = useNavigation()
  return (
    <View>
      <Button
        title="Email Variant"
        onPress={() => navigation.navigate("email")}
      />
      <Button
        title="Phone Number variant"
        onPress={() => navigation.navigate("phoneNumber")}
      />
    </View>
  )
}
