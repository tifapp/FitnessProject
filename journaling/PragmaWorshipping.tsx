import { useEffectEvent } from "@lib/utils/UseEffectEvent"
import { useFade, useSFX } from "./Audio"
import { Audio } from "expo-av"
import { sleep } from "@lib/utils/DelayData"
import { useEffect, useState } from "react"
import {
  Color,
  Group,
  LinearGradient,
  Rect,
  SkSize,
  vec
} from "@shopify/react-native-skia"
import { PragmaDrawing } from "./Pragma"
import {
  useDerivedValue,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated"
import { Platform } from "react-native"
import {
  MountainTopIntroDrawing,
  MountainTopIntroProps
} from "./MountainTopIntro"
import { useConst } from "@lib/utils/UseConst"

export type UsePragmaWorshippingEnvironment = {
  onJournalTimeStarted: () => void
}

export const usePragmaWorshipping = ({
  onJournalTimeStarted: onIntroStarted
}: UsePragmaWorshippingEnvironment) => {
  const { sound } = useSFX(require("../assets/audio/pragma-worship.mp3"))
  const { fadeOut } = useFade(1, (volume) => {
    sound?.setVolumeAsync(volume)
  })
  const [isShowingHolyLight, setIsShowingHolyLight] = useState(false)
  const run = useEffectEvent(async (sound: Audio.Sound) => {
    await sleep(3000)
    await sound.playAsync()
    setIsShowingHolyLight(true)
    await sleep(3000)
    fadeOut()
    onIntroStarted()
    await sleep(2000)
    setIsShowingHolyLight(false)
  })
  useEffect(() => {
    if (sound) {
      run(sound)
    }
    return () => {
      if (sound) {
        sound.stopAsync()
      }
    }
  }, [run, sound])
  return { isShowingHolyLight }
}

export const HOLY_LIGHT_COLORS = {
  sun: ["#FFED84AA", "#FFFFFF00"] as Color[],
  moon: ["#ABB0F4AA", "#FFFFFF00"] as Color[]
} as const

export type PragmaWorshippingProps = {
  state: ReturnType<typeof usePragmaWorshipping>
  holyLightColors: keyof typeof HOLY_LIGHT_COLORS
  size: SkSize
}

const PRAGMA_DIMENSIONS = { width: 256, height: 256 }

export const PragmaWorshippingDrawing = ({
  state,
  holyLightColors,
  size
}: PragmaWorshippingProps) => {
  const opacity = useSharedValue(0)
  const initialSize = useConst(size)
  const xCenter = initialSize.width / 2 - (Platform.OS === "ios" ? 64 : 80)
  const position = useSharedValue({
    x: xCenter,
    y: -(PRAGMA_DIMENSIONS.height / 2)
  })
  useEffect(() => {
    opacity.value = withTiming(state.isShowingHolyLight ? 1 : 0, {
      duration: 500
    })
  }, [state.isShowingHolyLight, opacity])
  useEffect(() => {
    const increment = (initialSize.height / 2 - 64) / 8
    position.value = withSequence(
      withTiming(
        { x: xCenter - 32, y: increment - PRAGMA_DIMENSIONS.height / 2 },
        { duration: 1000 }
      ),
      withTiming(
        { x: xCenter + 32, y: increment * 2 - PRAGMA_DIMENSIONS.height / 2 },
        { duration: 1000 }
      ),
      withTiming(
        { x: xCenter - 64, y: increment * 3 - PRAGMA_DIMENSIONS.height / 2 },
        { duration: 1000 }
      ),
      withTiming(
        { x: xCenter + 64, y: increment * 4 - PRAGMA_DIMENSIONS.height / 2 },
        { duration: 1000 }
      ),
      withTiming(
        { x: xCenter - 32, y: increment * 5 - PRAGMA_DIMENSIONS.height / 2 },
        { duration: 1000 }
      ),
      withTiming(
        { x: xCenter + 32, y: increment * 6 - PRAGMA_DIMENSIONS.height / 2 },
        { duration: 1000 }
      ),
      withTiming(
        { x: xCenter, y: initialSize.height / 2 - 64 },
        { duration: 500 }
      )
    )
  }, [initialSize.height, position, xCenter])
  return (
    <Group>
      <PragmaDrawing
        size={PRAGMA_DIMENSIONS}
        pose="worship"
        x={useDerivedValue(() => position.value.x)}
        y={useDerivedValue(() => position.value.y)}
      />
      <Rect width={size.width} height={size.height} opacity={opacity}>
        <LinearGradient
          colors={HOLY_LIGHT_COLORS[holyLightColors]}
          start={vec(size.width / 2, 0)}
          end={vec(size.width / 2, size.height)}
        />
      </Rect>
    </Group>
  )
}

export type PragmaWorshippingIntroProps = Omit<
  MountainTopIntroProps,
  "pragmaPose"
>

export const PragmaWorshippingIntroDrawing = (
  props: PragmaWorshippingIntroProps
) => <MountainTopIntroDrawing pragmaPose="worship" {...props} />
