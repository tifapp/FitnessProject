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
    transientEvent(0, { HapticIntensity: 0.5, HapticSharpness: 0.5 }),
    transientEvent(0.5, { HapticIntensity: 0.5, HapticSharpness: 0.5 }),
    continuousEvent(1, 3, {
      HapticIntensity: 1,
      HapticSharpness: 0.2,
      ReleaseTime: 1
    })
  ),
  parameters(
    parameterCurve("AudioBrightnessControl", 0, [
      keyFrame(1, 3),
      keyFrame(0.5, 4.5),
      keyFrame(0.1, 5.5)
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
