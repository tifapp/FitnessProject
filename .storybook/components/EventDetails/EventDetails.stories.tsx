import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React, { useState } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { EventArrivalBannerView } from "@event-details/arrival-tracking"
import { Button, View } from "react-native"
import Animated, { Layout } from "react-native-reanimated"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"

const EventDetailsMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Event Details"
}

export default EventDetailsMeta

type EventDetailsStory = ComponentStory<typeof SettingsScreen>

export const Basic: EventDetailsStory = () => {
  const [isClosed, setIsClosed] = useState(false)
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
        {!isClosed && (
          <EventArrivalBannerView
            onClose={() => setIsClosed(true)}
            style={{ padding: 16, width: "100%" }}
          />
        )}
        <Animated.View layout={Layout}>
          <Button onPress={() => setIsClosed(false)} title="Show" />
        </Animated.View>
      </View>
    </SafeAreaProvider>
  )
}
