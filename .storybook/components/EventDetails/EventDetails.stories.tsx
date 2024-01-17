import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { View } from "react-native"
import {
  EventDetailErrorView,
  EventDetailsLoadingView,
  useLoadEventDetails
} from "@event-details"
import { sleep } from "@lib/utils/DelayData"
import { TestInternetConnectionStatus } from "@test-helpers/InternetConnectionStatus"
import { InternetConnectionStatusProvider } from "@lib/InternetConnection"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import { createTestQueryClient } from "@test-helpers/ReactQuery"
import { QueryClientProvider } from "@tanstack/react-query"
import { BodyText } from "@components/Text"

const EventDetailsMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Event Details"
}

export default EventDetailsMeta

type EventDetailsStory = ComponentStory<typeof SettingsScreen>

const connectionStatus = new TestInternetConnectionStatus(false)

setInterval(
  () => connectionStatus.publishIsConnected(!connectionStatus.isConnected),
  5000
)

const queryClient = createTestQueryClient()

export const Basic: EventDetailsStory = () => (
  <QueryClientProvider client={queryClient}>
    <InternetConnectionStatusProvider status={connectionStatus}>
      <Screen />
    </InternetConnectionStatusProvider>
  </QueryClientProvider>
)

const Screen = () => {
  const result = useLoadEventDetails(1, async () => {
    await sleep(3000)
    throw new Error("Internet died")
  })
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
        {result.status === "loading" && <EventDetailsLoadingView />}
        {result.status === "error" && (
          <View>
            <EventDetailErrorView {...result} />
            <BodyText style={{ marginTop: 64 }}>
              Is Connected to Internet: {`${result.isConnectedToInternet}`}
            </BodyText>
          </View>
        )}
      </View>
    </SafeAreaProvider>
  )
}
