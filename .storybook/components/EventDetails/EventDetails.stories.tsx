import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React, { useEffect } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import {
  EventAttendeeMocks,
  EventMocks,
  mockEventLocation
} from "@event-details/MockData"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { UserLocationFunctionsProvider } from "@location/UserLocation"
import {
  getCurrentPositionAsync,
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync
} from "expo-location"
import { mockPlacemark } from "@location/MockData"
import { dateRange, dayjs, now } from "@date-time"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { createTestQueryClient } from "@test-helpers/ReactQuery"
import {
  EventDetailsMenuView,
  useEventDetailsMenuActions
} from "@event-details-boundary/Menu"
import { View } from "react-native"
import { CurrentUserEvent } from "@shared-models/Event"
import { useLoadEventDetails } from "@event-details-boundary/Details"
import { UserSessionProvider } from "@lib/UserSession"
import { TiFQueryClientProvider } from "@lib/ReactQuery"

const EventDetailsMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Event Details"
}

export default EventDetailsMeta

type EventDetailsStory = ComponentStory<typeof SettingsScreen>

const event = EventMocks.PickupBasketball

const Stack = createStackNavigator()

const location = {
  ...mockEventLocation(),
  coordinate: { latitude: 36.96493, longitude: -122.01693 },
  placemark: mockPlacemark()
}

const queryClient = createTestQueryClient()

export const Basic: EventDetailsStory = () => {
  useEffect(() => {
    queryClient.resetQueries()
  }, [])

  return (
    <SafeAreaProvider>
      {/* <SafeAreaView edges={["bottom"]}> */}
      <UserLocationFunctionsProvider
        getCurrentLocation={getCurrentPositionAsync}
        requestBackgroundPermissions={requestBackgroundPermissionsAsync}
        requestForegroundPermissions={requestForegroundPermissionsAsync}
      >
        <UserSessionProvider isSignedIn={async () => true}>
          <TiFQueryClientProvider>
            <BottomSheetModalProvider>
              <NavigationContainer>
                <Stack.Navigator
                  screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}
                >
                  <Stack.Screen name="test" component={Test} />
                </Stack.Navigator>
              </NavigationContainer>
            </BottomSheetModalProvider>
          </TiFQueryClientProvider>
        </UserSessionProvider>
      </UserLocationFunctionsProvider>
      {/* </SafeAreaView> */}
    </SafeAreaProvider>
  )
}

const host = EventAttendeeMocks.Alivs

const time = {
  secondsToStart: dayjs.duration(15.1, "minute").asSeconds(),
  todayOrTomorrow: "tomorrow",
  clientReceivedTime: new Date(),
  dateRange: dateRange(new Date(), now().add(1, "hour").toDate())
} as const

const Test = () => {
  const result = useLoadEventDetails(event.id, async () => ({
    status: "success",
    event
  }))
  if (result.status !== "success") return undefined
  return <Menu event={result.event} />
}

const Menu = ({ event }: { event: CurrentUserEvent }) => {
  const state = useEventDetailsMenuActions(event, {
    blockHost: async () => {
      console.log("Blocked")
    },
    unblockHost: async () => {
      console.log("Unblocked")
    }
  })
  console.error("isToggleBlockError", state.isToggleBlockHostError)
  return (
    <View
      style={{
        height: "100%",
        justifyContent: "center"
      }}
    >
      <EventDetailsMenuView
        event={event}
        state={state}
        eventShareContent={async () => ({
          title: "Test",
          url: "https://www.google.com",
          message: "Hello There"
        })}
        onCopyEventTapped={() => console.log("Copy")}
        onInviteFriendsTapped={() => console.log("Invite")}
        onContactHostTapped={() => console.log("Contact Host")}
        onReportEventTapped={() => console.log("Report")}
        onAssignNewHostTapped={() => console.log("Assign Host")}
      />
    </View>
  )
}
