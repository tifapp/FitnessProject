import { PrimaryButton } from "@components/Buttons"
import { Headline } from "@components/Text"
import { cloud } from "@journaling/Clouds"
import {
  JournalingSequenceProps,
  JournalingSequenceView,
  PreambleProps
} from "@journaling/JournalingSequence"
import { MoonBackgroundDrawing } from "@journaling/MoonBackground"
import { PragmaDrawing } from "@journaling/Pragma"
import {
  PragmaWorshippingDrawing,
  usePragmaWorshipping
} from "@journaling/PragmaWorshipping"
import { SunBackgroundDrawing } from "@journaling/SunBackground"
import { AppStyles } from "@lib/AppColorStyle"
import { Group, Rect, SkSize } from "@shopify/react-native-skia"
import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { useSharedValue, withTiming } from "react-native-reanimated"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StoryMeta } from "storybook/HelperTypes"
import { dateRange } from "TiFShared/domain-models/FixedDateRange"

export const SunJournalBackgroundMeta: StoryMeta = {
  title: "SunJournalBackground"
}

export default SunJournalBackgroundMeta

export const Basic = () => (
  <SafeAreaProvider>
    <TimeOfDayView />
  </SafeAreaProvider>
)

const CLOUDS = [
  cloud({
    relativeX: 0.6,
    relativeY: 0.1,
    relativeRangeX: 0.1,
    scale: 0.3,
    speed: 30_000
  }),
  cloud({
    relativeX: 0.4,
    relativeY: 0.15,
    relativeRangeX: 0.15,
    scale: 0.5,
    speed: 23_000
  }),
  cloud({
    relativeX: 0.6,
    relativeY: 0.17,
    relativeRangeX: 0.15,
    scale: 0.55,
    speed: 21_000
  }),
  cloud({
    relativeX: 0.03,
    relativeY: 0.23,
    relativeRangeX: 0.2,
    scale: 0.7,
    speed: 16_000
  }),
  cloud({
    relativeX: 0.2,
    relativeY: 0.26,
    relativeRangeX: 0.25,
    scale: 0.8,
    speed: 12_000
  })
]

const SUNRISE_DATE = new Date("2025-02-12T06:30:00")
const SUNSET_DATE = new Date("2025-02-12T16:30:00")
const DAY_RANGE = dateRange(SUNRISE_DATE, SUNSET_DATE)!

export const TimeOfDayView = () => {
  const [sequence, setSequence] = useState<SequenceProps | undefined>()
  if (!sequence) {
    return (
      <View style={{ marginTop: 128, rowGap: 16 }}>
        {JOURNAL_SEQUENCES.map((s, i) => (
          <PrimaryButton key={i} onPress={() => setSequence(s)}>
            <Headline style={{ color: "white" }}>Play {s.title}</Headline>
          </PrimaryButton>
        ))}
      </View>
    )
  }
  return (
    <JournalingSequenceView
      {...sequence}
      onFinished={() => setSequence(undefined)}
    />
  )
}

const PragmaSunWorshipping = ({
  onJournalTimeStarted,
  ...props
}: PreambleProps) => {
  const worshipping = usePragmaWorshipping({ onJournalTimeStarted })
  return (
    <PragmaWorshippingDrawing
      state={worshipping}
      holyLightColors="sun"
      {...props}
    />
  )
}

const IntroDrawing = ({ size }: { size: SkSize }) => {
  const opacity = useSharedValue(0)
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 })
  }, [opacity])
  return (
    <Group opacity={opacity}>
      <Rect
        width={size.width}
        height={size.height}
        color={AppStyles.colorOpacity50}
      />
      <PragmaDrawing
        size={{ width: size.width + 100, height: size.height + 100 }}
        pose="normal"
        x={-size.width / 4}
        y={size.height / 24}
        opacity={opacity}
      />
    </Group>
  )
}

const PragmaMoonWorshipping = ({
  onJournalTimeStarted,
  ...props
}: PreambleProps) => {
  const worshipping = usePragmaWorshipping({ onJournalTimeStarted })
  return (
    <PragmaWorshippingDrawing
      state={worshipping}
      holyLightColors="moon"
      {...props}
    />
  )
}

type SequenceProps = Omit<JournalingSequenceProps, "onFinished"> & {
  title: string
}

const JOURNAL_SEQUENCES = [
  {
    title: "Sun Worshipping",
    backgroundProps: { time: 0.5, dayRange: DAY_RANGE, clouds: CLOUDS },
    PreambleDrawing: PragmaSunWorshipping,
    BackgroundDrawing: SunBackgroundDrawing,
    introLines: "midday",
    IntroDrawing
  },
  {
    title: "Moon Worshipping",
    backgroundProps: { time: 0.5, dayRange: DAY_RANGE, clouds: CLOUDS },
    PreambleDrawing: PragmaMoonWorshipping,
    BackgroundDrawing: MoonBackgroundDrawing,
    introLines: "reallyLateNight",
    IntroDrawing
  }
] satisfies SequenceProps[]
