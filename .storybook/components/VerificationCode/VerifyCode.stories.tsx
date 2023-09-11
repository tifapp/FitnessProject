import {
  BASE_HEADER_SCREEN_OPTIONS,
  ChevronBackButton,
  XMarkBackButton
} from "@components/Navigation"
import { NavigationContainer, useNavigation } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { AuthVerificationCodeView } from "@auth"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Button, View } from "react-native"
import React, { useState } from "react"

const VerifyCodeMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Verifcation Code"
}

export default VerifyCodeMeta

type VerifyCodeStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

export const Basic: VerifyCodeStory = () => (
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
)

const EmailScreen = () => {
  return <AuthVerificationCodeView />
}

const PhoneNumberScreen = () => {
  return <AuthVerificationCodeView />
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
