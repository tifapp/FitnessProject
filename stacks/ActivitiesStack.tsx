import EventsList from "@components/EventsList"
import { headerOptions } from "@components/headerComponents/headerOptions"
import { CurrentUserEvent, EventMocks } from "@lib/events"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { ActivitiesScreenNavWrapper } from "@screens/ActivitiesScreenNavWrapper"
import { EventDetailsProps } from "@screens/EventDetails/EventDetails"
import { EventDetailsScreenNavWrapper } from "@screens/EventDetailsScreenNavWrapper"
import { EventFormScreenProps } from "@screens/EventFormScreen"
import { EventFormScreenNavWrapper } from "@screens/EventFormScreenNavWrapper"
import {
  LocationSearchPicker,
  LocationSearchPickerProps
} from "@screens/LocationSearch"

const Stack = createStackNavigator()

export enum ActivitiesScreenNames {
  EVENT_FORM = "Event Form",
  EVENT_DETAILS = "Event Details",
  MAP = "Map",
  LOCATION_SEARCH = "Location Search",
  CHAT_ROOM = "Chat Room",
  EVENT_LIST = "Event List"
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
  [ActivitiesScreenNames.LOCATION_SEARCH]: LocationSearchPickerProps
  [ActivitiesScreenNames.CHAT_ROOM]: undefined
  [ActivitiesScreenNames.EVENT_LIST]: undefined
}

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
  ActivitiesScreenNames.EVENT_LIST
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
        initialParams={events[2]}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.EVENT_LIST}
        component={EventsList}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.LOCATION_SEARCH}
        component={LocationSearchPicker}
      />
    </Stack.Navigator>
  )
}