import React, { useEffect } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import {
  EventAttendeeMocks,
  EventMocks,
  mockEventLocation
} from "@event-details-boundary/MockData"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { UserLocationFunctionsProvider } from "@location/UserLocation"
import {
  getCurrentPositionAsync,
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync
} from "expo-location"
import { mockPlacemark } from "@location/MockData"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { createTestQueryClient } from "@test-helpers/ReactQuery"
import { View } from "react-native"
import { ClientSideEvent } from "@event/ClientSideEvent"
import { useLoadEventDetails } from "@event-details-boundary/Details"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { dateRange } from "TiFShared/domain-models/FixedDateRange"
import { dayjs, now } from "TiFShared/lib/Dayjs"
import { StoryMeta } from ".storybook/HelperTypes"
import {
  JoinEventStagesView,
  loadJoinEventPermissions,
  useJoinEventStages
} from "@event-details-boundary/JoinEvent"
import { TrueRegionMonitor } from "@arrival-tracking/region-monitoring/MockRegionMonitors"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { TiFBottomSheetProvider } from "@components/BottomSheet"

const EventDetailsMeta: StoryMeta = {
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
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <UserLocationFunctionsProvider
          getCurrentLocation={getCurrentPositionAsync}
          requestBackgroundPermissions={requestBackgroundPermissionsAsync}
          requestForegroundPermissions={requestForegroundPermissionsAsync}
        >
          <TiFQueryClientProvider>
            <TiFBottomSheetProvider>
              <NavigationContainer>
                <Stack.Navigator
                  screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}
                >
                  <Stack.Screen name="test" component={Test} />
                </Stack.Navigator>
              </NavigationContainer>
            </TiFBottomSheetProvider>
          </TiFQueryClientProvider>
        </UserLocationFunctionsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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

const Menu = ({ event }: { event: ClientSideEvent }) => {
  const stage = useJoinEventStages(event, {
    monitor: TrueRegionMonitor,
    joinEvent: async () => "success",
    loadPermissions: async () => {
      const perms = await loadJoinEventPermissions()
      return perms.map((p) => ({ ...p, canRequestPermission: true }))
    }
  })
  return (
    <View
      style={{
        height: "100%",
        justifyContent: "center"
      }}
    >
      <JoinEventStagesView stage={stage} />
    </View>
  )
}
