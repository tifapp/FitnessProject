import { Title } from "@components/Text"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { useSFX } from "./Audio"
import { useEffect, useState } from "react"
import { useEffectEvent } from "@lib/utils/UseEffectEvent"
import { sleep } from "@lib/utils/DelayData"
import { Audio } from "expo-av"
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated"

export type UseJournalTimeEnvironment = {
  onFinished: () => void
}

export const useJournalTime = ({ onFinished }: UseJournalTimeEnvironment) => {
  const { sound } = useSFX(require("../assets/audio/journaling-intro.wav"))
  const [isShowing, setIsShowing] = useState(false)
  const play = useEffectEvent(async (sound: Audio.Sound) => {
    await sound?.playAsync()
    await sleep(2550)
    setIsShowing(true)
    await sleep(3000)
    setIsShowing(false)
    onFinished()
  })
  useEffect(() => {
    if (sound) {
      play(sound)
    }
  }, [play, sound])
  return { isShowing }
}

export type JournalTimeProps = {
  state: ReturnType<typeof useJournalTime>
  style?: StyleProp<ViewStyle>
}

export const JournalTimeView = ({ state, style }: JournalTimeProps) => (
  <View style={style}>{state.isShowing && <InnerView />}</View>
)

const InnerView = () => {
  const scale = useSharedValue(0.8)
  useEffect(() => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 200 }),
      withTiming(1, { duration: 3000 })
    )
  }, [scale])
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut}
      style={[
        styles.container,
        useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
      ]}
    >
      <Title style={styles.text}>Journal Time!</Title>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12
  },
  text: {
    padding: 24,
    textAlign: "center"
  }
})
