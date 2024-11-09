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
    transientEvent(0.0, { HapticIntensity: 0.9, HapticSharpness: 0.3 }),
    soundEffectEvent(
      "appear.caf",
      0.0,
      {
        AudioBrightness: 1.0,
        AudioPan: 0.3500000000000001,
        AudioPitch: 0.6500000000000001
      },
      {
        EventWaveformUseVolumeEnvelope: true,
        EventWaveformLoopEnabled: false
      }
    ),
    continuousEvent(0.0, 2.0, {
      AttackTime: 0.6600000000000001,
      DecayTime: 0.010000000000000009,
      HapticIntensity: 0.6,
      HapticSharpness: 0.2
    })
  ),
  parameters(
    parameterCurve("HapticIntensityControl", 0.0, [
      keyFrame(0.8, 0.0),
      keyFrame(0.7000000000000001, 1.0),
      keyFrame(0.0, 2.0)
    ])
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
