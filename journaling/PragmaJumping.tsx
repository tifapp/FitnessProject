import { useEffect, useState } from "react"
import { PragmaDrawing, PragmaPose } from "./Pragma"
import { useSFX } from "./Audio"
import { useEffectEvent } from "@lib/utils/UseEffectEvent"
import { Audio } from "expo-av"
import { sleep } from "@lib/utils/DelayData"
import { SkSize } from "@shopify/react-native-skia"
import { EdgeInsets } from "react-native-safe-area-context"
import {
  useDerivedValue,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated"
import { Platform } from "react-native"
import { useConst } from "@lib/utils/UseConst"
import { BaseMods } from "@expo/config-plugins"

export type UsePragmaJumpingEnvironment = {
  onJournalTimeStarted: () => void
}

export const usePragmaJumping = ({
  onJournalTimeStarted
}: UsePragmaJumpingEnvironment) => {
  const { sound } = useSFX(require("../assets/audio/pragma-jump.mp3"))
  const { sound: sound2 } = useSFX(require("../assets/audio/pragma-jump.mp3"))
  const { sound: sound3 } = useSFX(require("../assets/audio/pragma-jump.mp3"))
  const isLoaded = !!sound && !!sound2 && !!sound3
  const [pose, setPose] = useState<"standing" | "normal">("standing")
  const run = useEffectEvent(async () => {
    await sleep(1200)
    await sound?.playAsync()
    await sleep(300)
    await sound2?.playAsync()
    await sleep(300)
    await sound3?.playAsync()
    await sleep(1000)
    setPose("normal")
    onJournalTimeStarted()
  })
  const stop = useEffectEvent(() => {
    sound?.stopAsync()
    sound2?.stopAsync()
    sound3?.stopAsync()
  })
  useEffect(() => {
    if (isLoaded) run()
    return stop
  }, [isLoaded, run, stop])
  return { pose }
}

export type PragmaJumpingProps = {
  state: ReturnType<typeof usePragmaJumping>
  size: SkSize
  edgeInsets: EdgeInsets
}

const PRAGMA_POSING = {
  normal: {
    dimensions: { width: 256, height: 256 },
    offsets: { x: Platform.select({ ios: -96, android: -120 })!, y: 64 }
  },
  standing: {
    dimensions: { width: 196, height: 196 },
    offsets: { x: Platform.select({ ios: 16, android: -8 })!, y: 64 }
  }
} as const

export const PragmaJumpingDrawing = ({
  state,
  size,
  edgeInsets
}: PragmaJumpingProps) => {
  const baseHeight = size.height + 364
  const initialPosition = useConst({
    x: size.width / 2 - 128,
    y: baseHeight
  })
  const position = useSharedValue(initialPosition)
  useEffect(() => {
    position.value = withSequence(
      withTiming(initialPosition, { duration: 1200 }),
      withTiming(
        { x: size.width / 2 + 64, y: baseHeight - edgeInsets.bottom - 128 },
        { duration: 300 }
      ),
      withTiming(
        { x: size.width / 2 - 32, y: baseHeight - edgeInsets.bottom - 364 },
        { duration: 300 }
      ),
      withTiming({ x: size.width / 2, y: size.height / 2 }, { duration: 300 })
    )
  }, [position, initialPosition, edgeInsets, size, baseHeight])
  const { dimensions, offsets } = PRAGMA_POSING[state.pose]
  return (
    <PragmaDrawing
      size={dimensions}
      pose={state.pose}
      x={useDerivedValue(() => position.value.x + offsets.x)}
      y={useDerivedValue(() => position.value.y + offsets.y)}
    />
  )
}
