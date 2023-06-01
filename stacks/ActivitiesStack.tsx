import EventsList from "@components/EventsList"
import { BottomNavTabBar } from "@components/bottomTabComponents/BottomNavTabBar"
import { headerOptions } from "@components/headerComponents/headerOptions"
import { UserMocks } from "@lib/User"
import { CurrentUserEvent, EventMocks } from "@lib/events"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { ActivitiesScreenNavWrapper } from "@screens/ActivitiesScreenNavWrapper"
import { AttendeesListScreen } from "@screens/EventAttendeesList/AttendeesListScreen"
import { EventDetailsProps } from "@screens/EventDetails/EventDetails"
import { EventDetailsScreenNavWrapper } from "@screens/EventDetailsScreenNavWrapper"
import { EventFormScreenProps } from "@screens/EventFormScreen"
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
import { TestChatRoomScreen } from "@screens/testScreens/TestChatRoomScreen"
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

const events: CurrentUserEvent[] = [
  EventMocks.Multiday,
  EventMocks.NoPlacemarkInfo,
  EventMocks.PickupBasketball
]

export type ActivitiesStackParamList = {
  [ActivitiesScreenNames.EVENT_FORM]: EventFormScreenProps
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

/* export type LocationSearchScreenRouteProps = StackScreenProps<
  ActivitiesStackParamList,
  ActivitiesScreenNames.LOCATION_SEARCH
>["route"] */
/* export type GroupFeedScreenRouteProps = StackScreenProps<
  ActivitiesStackParamList,
  ActivitiesScreenNames.CHAT_ROOM
>["route"] */

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
        name={ActivitiesScreenNames.EVENT_DETAILS}
        component={EventDetailsScreenNavWrapper}
        initialParams={{ event: events[2] }}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.EVENT_LIST}
        component={EventsList}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.LOCATION_SEARCH}
        component={LocationSearchPicker}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.PROFILE_SCREEN}
        component={ProfileScreenNavWrapper}
        initialParams={{user: UserMocks.Mia}}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.SETTINGS_SCREEN}
        component={SettingsScreen}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.BOTTOM_NAV_TAB_BAR}
        component={BottomNavTabBar}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.ATTENDEES_LIST}
        component={AttendeesListScreen}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.CHAT_ROOM}
        component={TestChatRoomScreen}
      />
      {reportingScreens}
    </Stack.Navigator>
  )
}

export function TabNavigation () {
  return (
    <Tab.Navigator tabBar={(props) => <BottomNavTabBar {...props} />}>
      <Tab.Screen name="Map" component={ActivitiesStack} />
      <Tab.Screen name="Chat Room" component={TestChatRoomScreen} />
      <Tab.Screen
        name={ActivitiesScreenNames.EVENT_DETAILS}
        component={EventDetailsScreenNavWrapper}
        initialParams={{ event: events[2] }}
      />
      <Tab.Screen name="Notifications" component={TestNotifScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreenNavWrapper}
        initialParams={{user: UserMocks.Mia}}
      />
    </Tab.Navigator>
  )
}

// BottomTabBarProps<BottomTabBarOptions>
