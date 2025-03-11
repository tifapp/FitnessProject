import { TimeOfDayView } from "@event-details-boundary/TimeOfDay"
import React from "react"
import {
  SafeAreaProvider
} from "react-native-safe-area-context"
import { StoryMeta } from "storybook/HelperTypes"

export const SunJournalBackgroundMeta: StoryMeta = {
  title: "SunJournalBackground"
}

export default SunJournalBackgroundMeta

export const Basic = () => (
  <SafeAreaProvider>
    <TimeOfDayView />
  </SafeAreaProvider>
)