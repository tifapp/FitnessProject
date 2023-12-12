import { Headline } from "@components/Text"
import { SettingsScreen } from "@screens/SettingsScreen/SettingsScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"

const EventDetailsMeta: ComponentMeta<typeof SettingsScreen> = {
  title: "Event Details"
}

export default EventDetailsMeta

type EventDetailsStory = ComponentStory<typeof SettingsScreen>

export const Basic: EventDetailsStory = () => (
  <SafeAreaProvider>
    <Headline>Hello World</Headline>
  </SafeAreaProvider>
)
