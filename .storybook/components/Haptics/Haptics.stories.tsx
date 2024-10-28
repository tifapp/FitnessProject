import React, { useState } from "react"
import { Button, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Provider, atom } from "jotai"
import {
  hapticPattern,
  events,
  transientEvent,
  useHaptics
} from "@modules/tif-haptics"

const HapticsMeta = {
  title: "Haptics"
}

export default HapticsMeta

const testPattern = hapticPattern(
  events(transientEvent(0, { HapticIntensity: 0.5, HapticSharpness: 0.5 }))
)

export const Basic = () => {
  const haptics = useHaptics()
  return (
    <GestureHandlerRootView>
      <View style={{ marginTop: 256, paddingHorizontal: 24, rowGap: 24 }}>
        <Button title="Play" onPress={() => haptics.play(testPattern)} />
      </View>
    </GestureHandlerRootView>
  )
}
