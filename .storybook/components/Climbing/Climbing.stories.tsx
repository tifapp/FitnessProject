import { StoryMeta } from ".storybook/HelperTypes"
import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { SimpleJumpGame } from "./Climb"

const ClimbingMeta: StoryMeta = {
  title: "Climbing"
}

export default ClimbingMeta

export const Basic = () => (
  <SafeAreaProvider>
    <SimpleJumpGame />
  </SafeAreaProvider>
)
