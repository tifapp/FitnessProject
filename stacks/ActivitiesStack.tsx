import EventDetails, {
  EventDetailsProps
} from "@components/eventDetails/EventDetails"
import { headerOptions } from "@components/headerComponents/headerOptions"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { ActivitiesScreenNavWrapper } from "@screens/ActivitiesScreenNavWrapper"
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
  CHAT_ROOM = "Chat Room"
}

export type ActivitiesStackParamList = {
  [ActivitiesScreenNames.EVENT_FORM]: EventFormScreenProps
  [ActivitiesScreenNames.EVENT_DETAILS]: EventDetailsProps
  [ActivitiesScreenNames.MAP]: undefined
  [ActivitiesScreenNames.LOCATION_SEARCH]: LocationSearchPickerProps
  [ActivitiesScreenNames.CHAT_ROOM]: undefined
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

/* export type LocationSearchScreenRouteProps = StackScreenProps<
  ActivitiesStackParamList,
  ActivitiesScreenNames.LOCATION_SEARCH
>["route"] */
/* export type GroupFeedScreenRouteProps = StackScreenProps<
  ActivitiesStackParamList,
  ActivitiesScreenNames.CHAT_ROOM
>["route"] */

export default function ActivitiesStack () {
  console.log("Cool")
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
        component={EventDetails}
      />
      <Stack.Screen
        name={ActivitiesScreenNames.LOCATION_SEARCH}
        component={LocationSearchPicker}
      />
    </Stack.Navigator>
  )
}
