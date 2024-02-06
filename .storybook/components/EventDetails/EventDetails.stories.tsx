import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React, { useEffect } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { View } from "react-native"
import { EventMocks } from "@event-details/MockData"
import { JoinEventStagesView, useJoinEventStages } from "@event-details"
import { delayData } from "@lib/utils/DelayData"
import { TrueRegionMonitor } from "@event-details/arrival-tracking/region-monitoring/MockRegionMonitors"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import {
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

const EventDetailsMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Event Details"
}

export default EventDetailsMeta

type EventDetailsStory = ComponentStory<typeof SettingsScreen>

const event = EventMocks.PickupBasketball

export const Basic: EventDetailsStory = () => {
  return (
    <SafeAreaProvider>
      <View
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <UserLocationFunctionsProvider
          getCurrentLocation={getCurrentPositionAsync}
          requestBackgroundPermissions={requestBackgroundPermissionsAsync}
          requestForegroundPermissions={requestForegroundPermissionsAsync}
        >
          <TiFQueryClientProvider>
            <BottomSheetModalProvider>
              <Test />
            </BottomSheetModalProvider>
          </TiFQueryClientProvider>
        </UserLocationFunctionsProvider>
      </View>
    </SafeAreaProvider>
  )
}

const Test = () => {
  const stage = useJoinEventStages(event, {
    joinEvent: async () => {
      return await delayData("success", 2000)
    },
    loadPermissions: async () => [
      {
        id: "notifications",
        canRequestPermission: true,
        requestPermission: async () => {
          // await sleep(3000)
        }
      },
      {
        id: "backgroundLocation",
        canRequestPermission: true,
        requestPermission: async () => {
          // await sleep(3000)
        }
      }
    ],
    monitor: TrueRegionMonitor,
    onSuccess: () => console.log("success")
  })
  const result = useEventTravelEstimates(
    { latitude: 36.96493, longitude: -122.01693 },
    async (eventCoordinate, userCoordinate, signal) => {
      return await loadEventTravelEstimates(
        eventCoordinate,
        userCoordinate,
        ExpoTiFTravelEstimates!,
        signal
      )
    }
  )
  console.log(result)
  return <JoinEventStagesView stage={stage} />
}
