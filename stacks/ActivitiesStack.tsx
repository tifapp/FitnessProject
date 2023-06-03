import { BottomNavTabBar } from "@components/bottomTabComponents/BottomNavTabBar"
import { headerOptions } from "@components/headerComponents/headerOptions"
import { UserMocks } from "@lib/User"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { ActivitiesScreenNavWrapper } from "@screens/ActivitiesScreenNavWrapper"
import { EventDetailsProps } from "@screens/EventDetails/EventDetails"
import { createEventDetailsStackScreens } from "@screens/EventDetails/EventScreensNavigation"
import { EventFormScreenNavWrapper } from "@screens/EventFormScreenNavWrapper"
import {
  LocationSearchPicker,
  LocationSearchPickerProps
} from "@screens/LocationSearch"
import { ProfileScreenProps } from "@screens/ProfileScreen/ProfileScreen"
import { ProfileScreenNavWrapper } from "@screens/ProfileScreen/ProfileScreenNavWrapper"
import {
  ReportingScreensParamsList,
  createContentReportingStackScreens
} from "@screens/Reporting"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { TestEventFormScreen } from "@screens/testScreens/TestEventFormScreen"
import { TestNotifScreen } from "@screens/testScreens/TestNotifScreen"

const Stack = createStackNavigator<ActivitiesStackParamList>()
const Tab = createBottomTabNavigator()

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
  REPORTING_SCREENS = "Reporting Screens"
}

export type ActivitiesStackParamList = {
  "Events Stack": undefined
  [ActivitiesScreenNames.EVENT_FORM]: undefined
  [ActivitiesScreenNames.EVENT_DETAILS]: EventDetailsProps
  [ActivitiesScreenNames.MAP]: undefined
  [ActivitiesScreenNames.EVENT_LIST]: undefined
  [ActivitiesScreenNames.ATTENDEES_LIST]: undefined
  [ActivitiesScreenNames.LOCATION_SEARCH]: LocationSearchPickerProps
  [ActivitiesScreenNames.CHAT_ROOM]: undefined
  [ActivitiesScreenNames.BOTTOM_NAV_TAB_BAR]: undefined
  [ActivitiesScreenNames.PROFILE_SCREEN]: ProfileScreenProps
  [ActivitiesScreenNames.NOTIFICATIONS]: undefined
  [ActivitiesScreenNames.SETTINGS_SCREEN]: undefined
  [ActivitiesScreenNames.CHAT_ROOM]: undefined
} & ReportingScreensParamsList

const reportingScreens =
  createContentReportingStackScreens<ActivitiesStackParamList>(Stack, () => {
    throw new Error()
  })

const eventDetailsScreens =
  createEventDetailsStackScreens<ActivitiesStackParamList>(Stack)

export type EventFormScreenRouteProps = StackScreenProps<
  ActivitiesStackParamList,
  ActivitiesScreenNames.EVENT_FORM
>["route"]
export type EventDetailsScreenRouteProps = StackScreenProps<
  ActivitiesStackParamList,
  ActivitiesScreenNames.EVENT_DETAILS
>["route"]
export type ActivitiesScreenRouteProps = StackScreenProps<
  ActivitiesStackParamList,
  ActivitiesScreenNames.MAP
>["route"]
export type EventListRouteProps = StackScreenProps<
  ActivitiesStackParamList,
  ActivitiesScreenNames.BOTTOM_NAV_TAB_BAR
>["route"]
export type ProfileScreenRouteProps = StackScreenProps<
  ActivitiesStackParamList,
  ActivitiesScreenNames.PROFILE_SCREEN
>["route"]

export default function ActivitiesStack () {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name={ActivitiesScreenNames.MAP}
        component={ActivitiesScreenNavWrapper}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.EVENT_FORM}
        component={EventFormScreenNavWrapper}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.LOCATION_SEARCH}
        component={LocationSearchPicker}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.SETTINGS_SCREEN}
        component={SettingsScreen}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.BOTTOM_NAV_TAB_BAR}
        component={BottomNavTabBar}
      />
      {eventDetailsScreens}
      {reportingScreens}
    </Stack.Navigator>
  )
}

export function TabNavigation () {
  return (
    <Tab.Navigator tabBar={(props) => <BottomNavTabBar {...props} />}>
      <Tab.Screen
        name="Map"
        component={ActivitiesStack}
        options={{ tabBarVisible: false }}
      />
      <Tab.Screen name="Chat Room" component={SettingsScreen} />
      <Tab.Screen name="Event Form" component={TestEventFormScreen} />
      <Tab.Screen name="Notifications" component={TestNotifScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreenNavWrapper}
        initialParams={{ user: UserMocks.Mia }}
      />
    </Tab.Navigator>
  )
}
