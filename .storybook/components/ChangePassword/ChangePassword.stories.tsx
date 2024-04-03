import { ChangePasswordFormView, useChangePasswordForm } from "@core-auth"
import {
  BASE_HEADER_SCREEN_OPTIONS,
  ChevronBackButton
} from "@components/Navigation"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { delayData } from "@lib/utils/DelayData"
import {
  NavigationContainer,
  NavigationProp,
  ParamListBase,
  useNavigation
} from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { Button, View } from "react-native"
import { RootSiblingParent } from "react-native-root-siblings"
import { SafeAreaProvider } from "react-native-safe-area-context"

const ChangePasswordMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Change Password"
}

export default ChangePasswordMeta

type ChangePasswordStory = ComponentStory<typeof SettingsScreen>

const Stack = createStackNavigator()

export const Basic: ChangePasswordStory = () => (
  <RootSiblingParent>
    <TiFQueryClientProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
            <Stack.Screen name="test" component={TestScreen} />
            <Stack.Screen
              name="changePassword"
              options={{ headerLeft: () => <ChevronBackButton />, title: "" }}
              component={ChangePasswordScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </TiFQueryClientProvider>
  </RootSiblingParent>
)

const ChangePasswordScreen = () => {
  const form = useChangePasswordForm({
    changePassword: async () => await delayData("incorrect-password", 1500),
    onSuccess: () => console.log("Success")
  })
  return (
    <ChangePasswordFormView
      {...form}
      onForgotPasswordTapped={() => console.log("Forgot password")}
    />
  )
}

const TestScreen = () => {
  const navigation: NavigationProp<ParamListBase> = useNavigation()
  return (
    <View>
      <Button
        title="Go To Change Password"
        onPress={() => navigation.navigate("changePassword")}
      />
    </View>
  )
}
