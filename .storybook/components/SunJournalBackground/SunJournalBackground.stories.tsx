import { useJoinEvent } from "@event/JoinEvent"
import { cloud } from "@journaling/Clouds"
import {
  JournalingIntroView,
  useJournalingIntro
} from "@journaling/JournalingIntro"
import { JournalTimeView, useJournalTime } from "@journaling/JournalTime"
import { MoonBackgroundDrawing } from "@journaling/MoonBackground"
import { PragmaDrawing } from "@journaling/Pragma"
import { SunBackgroundDrawing } from "@journaling/SunBackground"
import { AppStyles } from "@lib/AppColorStyle"
import { Canvas, Group, Rect, SkSize } from "@shopify/react-native-skia"
import React, { useEffect, useMemo, useState } from "react"
import { View } from "react-native"
import { useSharedValue, withTiming } from "react-native-reanimated"
import {
  SafeAreaProvider,
  useSafeAreaInsets
} from "react-native-safe-area-context"
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

const getDayFraction = () => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  // Convert current time to decimal hours (e.g., 9:30 = 9.5)
  const currentTime = hours + minutes / 60

  // Define sunrise (6am) and sunset (6pm) in decimal hours
  const sunrise = 6
  const sunset = 18

  // Calculate the fraction
  let fraction = (currentTime - sunrise) / (sunset - sunrise)

  return fraction
}

export const TimeOfDayView = () => {
  const [size, setSize] = useState<SkSize>({ width: 0, height: 0 })
  const insets = useSafeAreaInsets()
  const [isShowingIntro, setIsShowingIntro] = useState(false)

  const [time, setTime] = useState(0.5)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // console.log(time)
  //     setTime((x) => (x >= 1 ? 0 : x + 0.1))
  //   }, 1000)
  //   return () => clearInterval(interval)
  // }, [])
  const background = useMemo(
    () => ({ time, dayRange: DAY_RANGE, clouds: CLOUDS }),
    [time]
  )
  const journalTime = useJournalTime({
    onFinished: () => setIsShowingIntro(true)
  })
  return (
    <View style={{ position: "relative", flex: 1 }}>
      <Canvas
        style={{ position: "absolute", height: "100%", width: "100%" }}
        onLayout={(e) => setSize(e.nativeEvent.layout)}
      >
        {/* <SunBackgroundDrawing
          size={size}
          background={background}
          edgeInsets={insets}
        /> */}
        <MoonBackgroundDrawing
          size={size}
          background={background}
          edgeInsets={insets}
        />
        {!isShowingIntro && (
          <PragmaDrawing
            size={{ width: 256, height: 256 }}
            pose="worship"
            x={size.width / 2 - 64}
            y={size.height / 2}
          />
        )}
        {isShowingIntro && <IntroDrawing size={size} />}
      </Canvas>
      {!isShowingIntro && (
        <JournalTimeView
          state={journalTime}
          style={{ justifyContent: "center", flex: 1, padding: 24 }}
        />
      )}
      {isShowingIntro && <IntroView />}
    </View>
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

const IntroView = () => {
  const journalIntro = useJournalingIntro({
    lines: "reallyLateNight",
    onFinished: () => {}
  })
  return (
    <JournalingIntroView
      state={journalIntro}
      style={{
        justifyContent: "flex-end",
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 64
      }}
    />
  )
}
