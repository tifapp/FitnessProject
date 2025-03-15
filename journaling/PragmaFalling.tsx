import { useEffectEvent } from "@lib/utils/UseEffectEvent"
import { useFade, useSFX } from "./Audio"
import { Audio } from "expo-av"
import { sleep } from "@lib/utils/DelayData"
import { useEffect } from "react"
import { AnimatedProp, Group, SkSize } from "@shopify/react-native-skia"
import { EdgeInsets } from "react-native-safe-area-context"
import { PragmaDrawing } from "./Pragma"
import { StarrySkyDrawing } from "./StarrySky"
import { SunSkyDrawing } from "./SunBackground"
import {
  useDerivedValue,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated"
import { useConst } from "@lib/utils/UseConst"
import "TiFShared/lib/Math"
import { Platform } from "react-native"
import { BackgroundProps } from "./JournalingSequence"
import { MovingCloudsDrawing } from "./Clouds"

export type UsePragmaFallingEnvironment = {
  onJournalTimeStarted: () => void
}

export const usePragmaFalling = ({
  onJournalTimeStarted
}: UsePragmaFallingEnvironment) => {
  const { sound } = useSFX(require("../assets/audio/pragma-scream.mp3"))
  const { fadeOut } = useFade(1, (volume) => {
    sound?.setVolumeAsync(volume)
  })
  const run = useEffectEvent(async (sound: Audio.Sound) => {
    await sleep(4000)
    await sound.playAsync()
    await sleep(1000)
    fadeOut()
    onJournalTimeStarted()
  })
  useEffect(() => {
    if (sound) run(sound)
    return () => {
      sound?.stopAsync()
    }
  }, [sound, run])
}

export type PragmaFallingProps = {
  size: SkSize
}

const PRAGMA_DIMENSIONS = { width: 256, height: 256 }

export const PragmaFallingDrawing = ({ size }: PragmaFallingProps) => {
  const initialPosition = useConst({
    x: size.width / 2 - (Platform.OS === "ios" ? 64 : 80),
    y: size.height / 2,
    rotation: 0
  })
  const position = useSharedValue(initialPosition)
  useEffect(() => {
    position.value = withSequence(
      withTiming(initialPosition, { duration: 1200 }),
      withTiming({ ...initialPosition, rotation: 5 }, { duration: 700 }),
      withTiming(initialPosition, { duration: 700 }),
      withTiming({ ...initialPosition, rotation: 15 }, { duration: 700 }),
      withTiming({ ...initialPosition, rotation: 5 }, { duration: 700 }),
      withTiming(
        { x: size.width * 1.5, y: size.height * 1.5, rotation: 200 },
        { duration: 1500 }
      )
    )
  }, [position, initialPosition, size])
  return (
    <Group
      origin={{ x: size.width / 2, y: size.height / 2 }}
      transform={useDerivedValue(() => [
        { rotate: (position.value.rotation * Math.PI) / 180 }
      ])}
    >
      <PragmaDrawing
        size={PRAGMA_DIMENSIONS}
        pose="normal"
        x={useDerivedValue(() => position.value.x)}
        y={useDerivedValue(() => position.value.y)}
      />
    </Group>
  )
}

export type PragmaFallingIntroProps = {
  theme: "sun" | "moon"
  background: BackgroundProps["background"]
  edgeInsets: EdgeInsets
  size: SkSize
  opacity: AnimatedProp<number>
}

const PRAGMA_INTRO_DIMENSIONS = { width: 384, height: 384 }

export const PragmaFallingIntroDrawing = ({
  theme,
  background,
  edgeInsets,
  size,
  opacity
}: PragmaFallingIntroProps) => (
  <Group opacity={opacity}>
    {theme === "moon" && <StarrySkyDrawing size={size} numStars={50} />}
    {theme === "sun" && (
      <SunSkyDrawing size={size} edgeInsets={edgeInsets} {...background} />
    )}
    {theme === "sun" && (
      <MovingCloudsDrawing size={size} clouds={background.clouds} />
    )}
    <Group
      origin={{ x: size.width / 2, y: size.height / 2 }}
      transform={[{ rotate: Math.degreesToRadians(200) }]}
    >
      <PragmaDrawing
        size={PRAGMA_INTRO_DIMENSIONS}
        pose="normal"
        x={size.width / 2}
        y={size.height * 0.8}
      />
    </Group>
  </Group>
)
