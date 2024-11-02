import React from "react"
import { Button, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import {
  hapticPattern,
  events,
  transientEvent,
  useHaptics,
  continuousEvent,
  parameters,
  parameterCurve,
  keyFrame,
  continuousSoundEvent,
  soundEffectEvent,
  dynamicParameter
} from "@modules/tif-haptics"
import { Headline } from "@components/Text"

const HapticsMeta = {
  title: "Haptics"
}

export default HapticsMeta

const testPattern = hapticPattern(
  events(
    continuousSoundEvent(0, 0.1, {
      AudioBrightness: 0.8,
      AudioPitch: 0.9,
      AudioVolume: 0.3
    }),
    continuousSoundEvent(0.15, 0.1, {
      AudioBrightness: 0.5,
      AudioPitch: 0.5,
      AudioVolume: 0.6
    }),
    continuousSoundEvent(0.3, 0.1, {
      AudioBrightness: 0.8,
      AudioPitch: 0.7,
      AudioVolume: 0.9
    })
  )
)

export const Basic = () => {
  const haptics = useHaptics()
  return (
    <GestureHandlerRootView>
      <View style={{ marginTop: 256, paddingHorizontal: 24, rowGap: 24 }}>
        {!haptics.isFeedbackSupportedOnDevice && (
          <Headline>
            Haptic feedback is not supported on this device. Please ensure that
            you are not using a simulator.
          </Headline>
        )}
        <Button title="Play" onPress={() => haptics.play(testPattern)} />
        <Button
          title="Mute"
          onPress={() => {
            haptics.apply({
              isHapticAudioEnabled: false,
              isHapticFeedbackEnabled: false
            })
          }}
        />
        <Button
          title="Unmute"
          onPress={() => {
            haptics.apply({
              isHapticAudioEnabled: true,
              isHapticFeedbackEnabled: true
            })
          }}
        />
      </View>
    </GestureHandlerRootView>
  )
}
