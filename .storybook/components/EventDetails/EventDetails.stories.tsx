import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React, { useEffect } from "react"
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
import { sleep } from "@lib/utils/DelayData"
import {
  JoinEventStagesView,
  loadJoinEventPermissions,
  useJoinEventStages
} from "@event-details/JoinEvent"
import { TrueRegionMonitor } from "@event-details/arrival-tracking/region-monitoring/MockRegionMonitors"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { createTestQueryClient } from "@test-helpers/ReactQuery"
import { QueryClientProvider } from "@tanstack/react-query"

const EventDetailsMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Event Details"
}

export default EventDetailsMeta

type EventDetailsStory = ComponentStory<typeof SettingsScreen>

const event = EventMocks.PickupBasketball

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
      <SafeAreaView>
        <UserLocationFunctionsProvider
          getCurrentLocation={getCurrentPositionAsync}
          requestBackgroundPermissions={requestBackgroundPermissionsAsync}
          requestForegroundPermissions={requestForegroundPermissionsAsync}
        >
          <QueryClientProvider client={queryClient}>
            <BottomSheetModalProvider>
              <Test />
            </BottomSheetModalProvider>
          </QueryClientProvider>
        </UserLocationFunctionsProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const host = EventAttendeeMocks.Alivs

const Test = () => {
  const currentStage = useJoinEventStages(EventMocks.Multiday, {
    monitor: TrueRegionMonitor,
    joinEvent: async () => "success",
    loadPermissions: loadJoinEventPermissions,
    onSuccess: () => {}
  })
  return <JoinEventStagesView stage={currentStage} />
}
