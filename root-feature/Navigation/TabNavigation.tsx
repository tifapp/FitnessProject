import BottomNavTabBar from "@components/bottomTabComponents/BottomNavTabBar"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { getFocusedRouteNameFromRoute } from "@react-navigation/native"
import { ProfileStack } from "@screens/ProfileScreen/Navigation/ProfileScreensNavigation"
import { TestChatRoomScreen } from "@screens/TestScreens/TestChatRoomScreen"
import { TestEventFormScreen } from "@screens/TestScreens/TestEventFormScreen"
import { TestNotifScreen } from "@screens/TestScreens/TestNotifScreen"
import React from "react"

const Tab = createBottomTabNavigator()

const getTabBarVisibility = (route: any) => {
  const routeName = getFocusedRouteNameFromRoute(route)!
  const tabHiddenRoutes = [
    "EditProfileScreen",
    "SettingsScreen",
    "ChangePasswordScreen"
  ]
  if (tabHiddenRoutes.includes(routeName)) {
    return false
  }
  return true
}

export function TabNavigation () {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Chat Room" component={TestChatRoomScreen} />
      <Tab.Screen name="Event Form" component={TestEventFormScreen} />
      <Tab.Screen name="Notifications" component={TestNotifScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={({ route }) => ({
          tabBarStyle: getTabBarVisibility(route)
            ? { display: "none" }
            : undefined
        })}
      />
    </Tab.Navigator>
  )
}
