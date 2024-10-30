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
    continuousEvent(0.0, 2.0, {
      DecayTime: 0.9,
      HapticIntensity: 0.5,
      HapticSharpness: 0.67
    }),
    transientEvent(0.1, { HapticIntensity: 0.8, HapticSharpness: 0.2 }),
    soundEffectEvent(
      "bang.caf",
      0.5,
      { AudioVolume: 0.5 },
      {
        EventWaveformUseVolumeEnvelope: false,
        EventWaveformLoopEnabled: false,
        EventDuration: 3.0
      }
    ),
    continuousSoundEvent(
      2.0,
      2.0,
      {
        AudioBrightness: 0.9,
        AudioPitch: 0.6,
        AudioVolume: 0.8
      },
      { EventWaveformUseVolumeEnvelope: true }
    )
  ),
  parameters(
    dynamicParameter("AudioReleaseTimeControl", 0.4, 0.5),
    parameterCurve("AudioPanControl", 0.0, [keyFrame(1.0, 0.0)]),
    parameterCurve("HapticIntensityControl", 0.0, [
      keyFrame(0.1, 0.0),
      keyFrame(0.8, 0.5),
      keyFrame(0.4, 1.2)
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
