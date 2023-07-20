import React from "react"
import EventsList from "@components/EventsList"
import { ChevronBackButton, StackNavigatorType } from "@components/Navigation"
import { EventMocks } from "@lib/events"
import { StackScreenProps } from "@react-navigation/stack"
import { AttendeesListScreen } from "@screens/EventAttendeesList/AttendeesListScreen"
import { EventDetailsScreenNavWrapper } from "@screens/EventDetailsScreenNavWrapper"
import {
  ProfileScreenProps,
  ProfileStack
} from "@screens/ProfileScreen/Navigation/ProfileScreensNavigation"
import { TestChatRoomScreen } from "@screens/testScreens/TestChatRoomScreen"
import { EventDetailsProps } from "./EventDetails"

export type EventScreensParamsList = {
  "Event List": undefined
  "Event Details": EventDetailsProps
  "Profile Screen": ProfileScreenProps
  "Attendees List": undefined
  "Chat Room": undefined
}

export type EventDetailsScreenRouteProps = StackScreenProps<
  EventScreensParamsList,
  "Event Details"
>["route"]

export type ProfileScreenRouteProps = StackScreenProps<
  EventScreensParamsList,
  "Profile Screen"
>["route"]

export const createEventDetailsStackScreens = <
  T extends EventScreensParamsList
>(
    stack: StackNavigatorType<T>
  ) => {
  return (
    <>
      <stack.Screen name={"Event List"} component={EventsList} />
      <stack.Screen
        name={"Event Details"}
        options={{
          headerTitle: "",
          headerLeft: ChevronBackButton
        }}
        component={EventDetailsScreenNavWrapper}
        initialParams={{ event: EventMocks.PickupBasketball }}
      />
      <stack.Screen name={"Profile Screen"} component={ProfileStack} />
      <stack.Screen name={"Attendees List"} component={AttendeesListScreen} />
      <stack.Screen name={"Chat Room"} component={TestChatRoomScreen} />
    </>
  )
}
