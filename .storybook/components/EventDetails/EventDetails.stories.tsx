import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { View } from "react-native"
import {
  EventAttendeeMocks,
  EventMocks,
  mockEventLocation
} from "@event-details/MockData"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import {
  EventTravelEstimatesView,
  loadEventTravelEstimates,
  useEventTravelEstimates
} from "@event-details/TravelEstimates"
import { ExpoTiFTravelEstimates } from "@modules/tif-travel-estimates"
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

export const Basic: EventDetailsStory = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <View
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <UserLocationFunctionsProvider
              getCurrentLocation={getCurrentPositionAsync}
              requestBackgroundPermissions={requestBackgroundPermissionsAsync}
              requestForegroundPermissions={requestForegroundPermissionsAsync}
            >
              <TiFQueryClientProvider>
                <Test />
              </TiFQueryClientProvider>
            </UserLocationFunctionsProvider>
          </View>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
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
