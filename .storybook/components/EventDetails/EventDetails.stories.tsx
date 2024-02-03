import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { View } from "react-native"
import { EventMocks } from "@event-details/MockData"
import { JoinEventStagesView, useJoinEventStages } from "@event-details"
import { delayData } from "@lib/utils/DelayData"
import { TrueRegionMonitor } from "@event-details/arrival-tracking/region-monitoring/MockRegionMonitors"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"

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
        <TiFQueryClientProvider>
          <BottomSheetModalProvider>
            <Test />
          </BottomSheetModalProvider>
        </TiFQueryClientProvider>
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
  return <JoinEventStagesView stage={stage} />
}
