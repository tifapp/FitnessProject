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
    continuousSoundEvent(0, 2, {
      AudioVolume: 0.5,
      AudioPan: 0.7,
      AudioPitch: -0.3
    }),
    transientEvent(0.0, {
      HapticIntensity: 0.7216312289237976,
      HapticSharpness: 0.4828604757785797
    }),
    transientEvent(0.18321476876735687, {
      HapticIntensity: 0.9426712989807129,
      HapticSharpness: 0.8031914830207825
    }),
    transientEvent(0.9278956055641174, {
      HapticIntensity: 1.0,
      HapticSharpness: 1.0
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
