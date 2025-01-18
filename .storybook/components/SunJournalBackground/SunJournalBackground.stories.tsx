import React from "react"
import { View, Text } from "react-native"
import { StoryMeta } from "storybook/HelperTypes"
import { Canvas } from "@shopify/react-native-skia"
import { SunBackgroundView } from "@journaling/SunBackground"

export const SunJournalBackgroundMeta: StoryMeta = {
  title: "SunJournalBackground"
}

export default SunJournalBackgroundMeta

export const Basic = () => (
  <Canvas style={{ flex: 1 }}>
    <SunBackgroundView />
  </Canvas>
)
