import { ChevronBackButton } from "@components/Navigation"
import { Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { useNavigation } from "@react-navigation/native"
import {
  StackNavigationProp,
  createStackNavigator
} from "@react-navigation/stack"
import BlockedUsersListView from "@screens/BlockedUsersList/BlockedUsersListView"
import { SettingsScreenView } from "@screens/SettingsScreen/SettingsScreenView"
import React from "react"
import "react-native-gesture-handler"

const Stack = createStackNavigator()

export enum SettingsScreenNames {
  SETTINGS = "Settings",
  BLOCKED_USERS = "Blocked Users",
  CHANGE_PASSWORD = "Change Password"
}

const SettingsStack = () => {
  return (
    <Stack.Navigator initialRouteName={SettingsScreenNames.SETTINGS}>
      <Stack.Screen
        name={SettingsScreenNames.SETTINGS}
        component={SettingsScreen}
        options={{
          headerTitle: () => (
            <Headline style={{ color: AppStyles.darkColor }}>Settings</Headline>
          ),
          headerTitleAlign: "center",
          headerLeft: () => <ChevronBackButton />
        }}
      />
      <Stack.Screen
        name={SettingsScreenNames.BLOCKED_USERS}
        component={BlockedUsersListView}
        options={{
          headerLeft: () => <ChevronBackButton />,
          headerTitle: ""
        }}
      />
    </Stack.Navigator>
  )
}

export const SettingsScreen = () => {
  const { navigate } = useNavigation<StackNavigationProp<any>>()

  return (
    <SettingsScreenView
      navigateToBlocked={() => navigate(SettingsScreenNames.BLOCKED_USERS)}
    />
  )
}

export default SettingsStack
