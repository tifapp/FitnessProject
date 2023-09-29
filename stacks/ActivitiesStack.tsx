import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { BottomNavTabBar } from "@components/bottomTabComponents/BottomNavTabBar"
import { EventMocks } from "@lib/events"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { getFocusedRouteNameFromRoute } from "@react-navigation/native"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { EventDetailsProps } from "@screens/EventDetails/EventDetails"
import { createEventDetailsStackScreens } from "@screens/EventDetails/EventScreensNavigation"
import { EventFormScreenNavWrapper } from "@screens/EventFormScreenNavWrapper"
import {
  ExploreEventsScreensParamsList,
  createExploreEventsScreens
} from "@screens/ExploreEvents"
import {
  LocationSearchPicker,
  LocationSearchPickerProps
} from "@screens/LocationSearch"
import {
  ProfileScreenProps,
  ProfileScreensParamsList,
  ProfileStack,
  createProfileStackScreens
} from "@screens/ProfileScreen/Navigation/ProfileScreensNavigation"
import { SignInScreensParamsList } from "@screens/ProfileScreen/Navigation/SignInScreensNavigation"
import {
  ReportingScreensParamsList,
  createContentReportingStackScreens
} from "@screens/Reporting"
import { TestChatRoomScreen } from "@screens/testScreens/TestChatRoomScreen"
import { TestEventFormScreen } from "@screens/testScreens/TestEventFormScreen"
import { TestNotifScreen } from "@screens/testScreens/TestNotifScreen"
import React from "react"

export enum ActivitiesScreenNames {
  EVENT_FORM = "Event Form",
  EVENT_DETAILS = "Event Details",
  MAP = "Map",
  LOCATION_SEARCH = "Location Search",
  CHAT_ROOM = "Chat Room",
  EVENT_LIST = "Event List",
  BOTTOM_NAV_TAB_BAR = "Bottom Nav Tab Tab Bar",
  PROFILE_SCREEN = "Profile Screen",
  SETTINGS_SCREEN = "Settings Screen",
  ATTENDEES_LIST = "Attendees List",
  NOTIFICATIONS = "Notifications",
  REPORTING_SCREENS = "Reporting Screens",
  EDIT_PROFILE = "Edit Profile Screen",
  CURRENT_USER_PROFILE = "Current User Profile",
  CHANGE_PASSWORD = "Change Password"
}

export type ActivitiesStackParamList = {
  "Events Stack": undefined
  [ActivitiesScreenNames.EVENT_FORM]: undefined
  [ActivitiesScreenNames.EVENT_DETAILS]: EventDetailsProps
  [ActivitiesScreenNames.EVENT_LIST]: undefined
  [ActivitiesScreenNames.ATTENDEES_LIST]: undefined
  [ActivitiesScreenNames.LOCATION_SEARCH]: LocationSearchPickerProps
  [ActivitiesScreenNames.CHAT_ROOM]: undefined
  [ActivitiesScreenNames.BOTTOM_NAV_TAB_BAR]: undefined
  [ActivitiesScreenNames.PROFILE_SCREEN]: ProfileScreenProps
  [ActivitiesScreenNames.CURRENT_USER_PROFILE]: ProfileScreenProps
  [ActivitiesScreenNames.NOTIFICATIONS]: undefined
  [ActivitiesScreenNames.SETTINGS_SCREEN]: undefined
  [ActivitiesScreenNames.CHAT_ROOM]: undefined
  [ActivitiesScreenNames.EDIT_PROFILE]: undefined
  [ActivitiesScreenNames.CHANGE_PASSWORD]: undefined
} & ReportingScreensParamsList &
  ProfileScreensParamsList &
  SignInScreensParamsList &
  ExploreEventsScreensParamsList

const Stack = createStackNavigator<ActivitiesStackParamList>()
const Tab = createBottomTabNavigator()

const reportingScreens =
  createContentReportingStackScreens<ActivitiesStackParamList>(Stack, () => {
    throw new Error()
  })

const profileScreens =
  createProfileStackScreens<ActivitiesStackParamList>(Stack)
const eventDetailsScreens =
  createEventDetailsStackScreens<ActivitiesStackParamList>(Stack)

const exploreEventsScreens = createExploreEventsScreens(Stack, () => ({
  value: Promise.resolve([EventMocks.PickupBasketball]),
  cancel: () => {}
}))

export type EventFormScreenRouteProps = StackScreenProps<
  ActivitiesStackParamList,
  ActivitiesScreenNames.EVENT_FORM
>["route"]
export type EventDetailsScreenRouteProps = StackScreenProps<
  ActivitiesStackParamList,
  ActivitiesScreenNames.EVENT_DETAILS
>["route"]
export type EventListRouteProps = StackScreenProps<
  ActivitiesStackParamList,
  ActivitiesScreenNames.BOTTOM_NAV_TAB_BAR
>["route"]
export type ProfileScreenRouteProps = StackScreenProps<
  ActivitiesStackParamList,
  ActivitiesScreenNames.PROFILE_SCREEN
>

export default function ActivitiesStack () {
  return (
    <Stack.Navigator screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}>
      {exploreEventsScreens}
      <Stack.Screen
        name={ActivitiesScreenNames.EVENT_FORM}
        component={EventFormScreenNavWrapper}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.LOCATION_SEARCH}
        component={LocationSearchPicker}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.BOTTOM_NAV_TAB_BAR}
        component={BottomNavTabBar}
      />

      {eventDetailsScreens}
      {reportingScreens}
      {profileScreens}
    </Stack.Navigator>
  )
}

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
    <Tab.Navigator tabBar={(props) => <BottomNavTabBar {...props} />}>
      <Tab.Screen name="Map" component={ActivitiesStack} />
      <Tab.Screen name="Chat Room" component={TestChatRoomScreen} />
      <Tab.Screen name="Event Form" component={TestEventFormScreen} />
      <Tab.Screen name="Notifications" component={TestNotifScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={({ route }) => ({
          tabBarVisible: getTabBarVisibility(route)
        })}
      />
    </Tab.Navigator>
  )
}
