import { PrimaryButton } from "@components/Buttons"
import { Headline } from "@components/Text"
import { cloud } from "@journaling/Clouds"
import {
  IntroDrawingProps,
  JournalingSequenceProps,
  JournalingSequenceView,
  PreambleProps
} from "@journaling/JournalingSequence"
import { MoonBackgroundDrawing } from "@journaling/MoonBackground"
import { MountainTopIntroDrawing } from "@journaling/MountainTopIntro"
import { PragmaDrawing } from "@journaling/Pragma"
import {
  PragmaFallingDrawing,
  PragmaFallingIntroDrawing,
  usePragmaFalling
} from "@journaling/PragmaFalling"
import {
  PragmaJumpingDrawing,
  usePragmaJumping
} from "@journaling/PragmaJumping"
import {
  PragmaWorshippingDrawing,
  PragmaWorshippingIntroDrawing,
  usePragmaWorshipping
} from "@journaling/PragmaWorshipping"
import { SunBackgroundDrawing } from "@journaling/SunBackground"
import { AppStyles } from "@lib/AppColorStyle"
import { Group, Rect, SkSize } from "@shopify/react-native-skia"
import React, { useEffect, useMemo, useState } from "react"
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

type SequenceProps = Omit<JournalingSequenceProps, "onFinished"> & {
  title: string
}

const FALLING_BACKGROUND_CLOUDS = [
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

const JOURNAL_SEQUENCES = [
  {
    title: "Sunrise",
    backgroundProps: { time: 0.045, dayRange: DAY_RANGE, clouds: CLOUDS },
    PreambleDrawing: ({ onJournalTimeStarted, ...props }: PreambleProps) => {
      const state = usePragmaJumping({ onJournalTimeStarted })
      return <PragmaJumpingDrawing state={state} {...props} />
    },
    BackgroundDrawing: SunBackgroundDrawing,
    introLines: "sunrise",
    IntroDrawing: (props) => (
      <MountainTopIntroDrawing
        theme="sun"
        pragmaPose="normal"
        dayRange={DAY_RANGE}
        time={0.045}
        includeThemeObject
        {...props}
      />
    )
  },
  {
    title: "Morning",
    backgroundProps: { time: 0.3, dayRange: DAY_RANGE, clouds: CLOUDS },
    PreambleDrawing: ({ onJournalTimeStarted, ...props }: PreambleProps) => {
      usePragmaFalling({ onJournalTimeStarted })
      return <PragmaFallingDrawing {...props} />
    },
    BackgroundDrawing: SunBackgroundDrawing,
    introLines: "morning",
    IntroDrawing: (props) => (
      <PragmaFallingIntroDrawing
        theme="sun"
        background={useMemo(
          () => ({ time: 0.3, dayRange: DAY_RANGE, clouds: CLOUDS }),
          []
        )}
        {...props}
      />
    )
  },
  {
    title: "Noon",
    backgroundProps: { time: 0.5, dayRange: DAY_RANGE, clouds: CLOUDS },
    PreambleDrawing: ({ onJournalTimeStarted, ...props }: PreambleProps) => {
      const worshipping = usePragmaWorshipping({ onJournalTimeStarted })
      return (
        <PragmaWorshippingDrawing
          state={worshipping}
          holyLightColors="sun"
          {...props}
        />
      )
    },
    BackgroundDrawing: SunBackgroundDrawing,
    introLines: "midday",
    IntroDrawing: (props) => (
      <PragmaWorshippingIntroDrawing
        theme="sun"
        dayRange={DAY_RANGE}
        time={0.5}
        {...props}
      />
    )
  },
  {
    title: "Afternoon",
    backgroundProps: { time: 0.75, dayRange: DAY_RANGE, clouds: CLOUDS },
    PreambleDrawing: ({ onJournalTimeStarted, ...props }: PreambleProps) => {
      const state = usePragmaJumping({ onJournalTimeStarted })
      return <PragmaJumpingDrawing state={state} {...props} />
    },
    BackgroundDrawing: SunBackgroundDrawing,
    introLines: "afternoon",
    IntroDrawing: (props) => (
      <MountainTopIntroDrawing
        theme="sun"
        pragmaPose="normal"
        dayRange={DAY_RANGE}
        time={0.75}
        includeThemeObject
        {...props}
      />
    )
  },
  {
    title: "Sunset",
    backgroundProps: { time: 0.975, dayRange: DAY_RANGE, clouds: CLOUDS },
    PreambleDrawing: ({ onJournalTimeStarted, ...props }: PreambleProps) => {
      usePragmaFalling({ onJournalTimeStarted })
      return <PragmaFallingDrawing {...props} />
    },
    BackgroundDrawing: SunBackgroundDrawing,
    introLines: "sunset",
    IntroDrawing: (props) => (
      <PragmaFallingIntroDrawing
        theme="sun"
        background={useMemo(
          () => ({ time: 0.975, dayRange: DAY_RANGE, clouds: CLOUDS }),
          []
        )}
        {...props}
      />
    )
  },
  {
    title: "Night",
    backgroundProps: { time: 0.35, dayRange: DAY_RANGE, clouds: CLOUDS },
    PreambleDrawing: ({ onJournalTimeStarted, ...props }: PreambleProps) => {
      usePragmaFalling({ onJournalTimeStarted })
      return <PragmaFallingDrawing {...props} />
    },
    BackgroundDrawing: MoonBackgroundDrawing,
    introLines: "night",
    IntroDrawing: (props) => (
      <PragmaFallingIntroDrawing
        theme="moon"
        background={useMemo(
          () => ({ time: 0.35, dayRange: DAY_RANGE, clouds: CLOUDS }),
          []
        )}
        {...props}
      />
    )
  },
  {
    title: "Midnight",
    backgroundProps: { time: 0.5, dayRange: DAY_RANGE, clouds: CLOUDS },
    PreambleDrawing: ({ onJournalTimeStarted, ...props }: PreambleProps) => {
      const worshipping = usePragmaWorshipping({ onJournalTimeStarted })
      return (
        <PragmaWorshippingDrawing
          state={worshipping}
          holyLightColors="moon"
          {...props}
        />
      )
    },
    BackgroundDrawing: MoonBackgroundDrawing,
    introLines: "reallyLateNight",
    IntroDrawing: (props) => (
      <PragmaWorshippingIntroDrawing
        theme="moon"
        dayRange={DAY_RANGE}
        time={0.5}
        {...props}
      />
    )
  },
  {
    title: "Bullying",
    backgroundProps: { time: 0.75, dayRange: DAY_RANGE, clouds: CLOUDS },
    PreambleDrawing: ({ onJournalTimeStarted, ...props }: PreambleProps) => {
      const state = usePragmaJumping({ onJournalTimeStarted })
      return <PragmaJumpingDrawing state={state} {...props} />
    },
    BackgroundDrawing: MoonBackgroundDrawing,
    introLines: "bullying",
    IntroDrawing: (props) => (
      <MountainTopIntroDrawing
        theme="moon"
        pragmaPose="standing"
        dayRange={DAY_RANGE}
        time={0.75}
        includeThemeObject
        {...props}
      />
    )
  }
] satisfies SequenceProps[]
