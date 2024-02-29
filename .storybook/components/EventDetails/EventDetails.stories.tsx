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
import { createTestQueryClient } from "@test-helpers/ReactQuery"
import { QueryClientProvider } from "@tanstack/react-query"
import { EventCountdownView, useEventCountdown } from "@event-details/Countdown"
import { dateRange, dayjs, now } from "@date-time"
import { View } from "react-native"
import { JoinEventStagesView } from "@event-details/JoinEvent"
import { NavigationContainer, useFocusEffect } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { AppState } from "@aws-amplify/core"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"

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
      {/* <SafeAreaView> */}
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
  secondsToStart: -dayjs.duration(14, "minute").asSeconds(),
  todayOrTomorrow: "today",
  clientReceivedTime: new Date(),
  dateRange: dateRange(new Date(), now().add(1, "hour").toDate())
} as const

const Test = () => {
  const result = useEventCountdown(time)
  return (
    <View style={{ height: "100%" }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 64,
          flex: 1
        }}
      >
        <EventCountdownView result={result} />
        <JoinEventStagesView
          stage={{ id: "idle", joinButtonTapped: () => {} }}
        />
      </View>
    </View>
  )
}
