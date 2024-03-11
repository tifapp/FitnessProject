import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React, { useCallback, useEffect } from "react"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
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
import { EventCountdownView, eventCountdown } from "@event-details/Countdown"
import { dateRange, dayjs, now } from "@date-time"
import { JoinEventStagesView } from "@event-details/JoinEvent"
import { NavigationContainer, useFocusEffect } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { AppState } from "@aws-amplify/core"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { sleep } from "@lib/utils/DelayData"
import { TrueRegionMonitor } from "@event-details/arrival-tracking/region-monitoring/MockRegionMonitors"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { createTestQueryClient } from "@test-helpers/ReactQuery"
import { QueryClientProvider } from "@tanstack/react-query"
import { EventDetailsMenuView } from "@event-details/Menu"
import { View } from "react-native"
import { NonCompliantChecksCount } from "aws-sdk/clients/iot"
import { CurrentUserEvent } from "@shared-models/Event"

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
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}
              >
                <Stack.Screen name="test" component={Test} />
              </Stack.Navigator>
            </NavigationContainer>
          </BottomSheetModalProvider>
        </QueryClientProvider>
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
  return (
    <View
      style={{
        height: "100%",
        justifyContent: "center"
      }}
    >
      <EventDetailsMenuView
        event={
          {
            title: "Test Event",
            userAttendeeStatus: "attending",
            host: {
              ...host,
              relations: { youToThem: "not-friends", themToYou: "not-friends" }
            }
          } as CurrentUserEvent
        }
        eventShareContent={async () => ({
          title: "Test",
          url: "https://www.google.com",
          message: "Hello There"
        })}
        onBlockHostToggled={() => console.log("Block Toggled")}
        onCopyEventTapped={() => console.log("Copy")}
        onInviteFriendsTapped={() => console.log("Invite")}
        onContactHostTapped={() => console.log("Contact Host")}
        onReportEventTapped={() => console.log("Report")}
        onAssignNewHostTapped={() => console.log("Assign Host")}
      />
    </View>
  )
}
