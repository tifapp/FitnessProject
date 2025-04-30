import { AnimatedProp, Canvas, Group, SkSize } from "@shopify/react-native-skia"
import { MoonBackgroundProps } from "./MoonBackground"
import { SunBackgroundProps } from "./SunBackground"
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context"
import React, { useEffect, useState } from "react"
import {
  JournalingIntroView,
  PRAGMA_LINES,
  UseJournalingIntroEnvironment,
  useJournalingIntro
} from "./JournalingIntro"
import { View, StyleSheet } from "react-native"
import {
  UseJournalTimeEnvironment,
  useJournalTime,
  JournalTimeView
} from "./JournalTime"
import { useScreenBottomPadding } from "@components/Padding"
import {
  useDerivedValue,
  useSharedValue,
  withTiming
} from "react-native-reanimated"
import { useSFX } from "./Audio"

export type BackgroundProps = SunBackgroundProps | MoonBackgroundProps

export type PreambleProps = {
  onJournalTimeStarted: () => void
  size: SkSize
  edgeInsets: EdgeInsets
}

export type IntroDrawingProps = {
  size: SkSize
  edgeInsets: EdgeInsets
  opacity: AnimatedProp<number>
}

export type JournalingSequenceProps = {
  backgroundProps: BackgroundProps["background"]
  BackgroundDrawing: (props: BackgroundProps) => JSX.Element
  PreambleDrawing: (props: PreambleProps) => JSX.Element
  introLines: keyof typeof PRAGMA_LINES
  IntroDrawing: (props: IntroDrawingProps) => JSX.Element
  onFinished: () => void
}

const EMPTY_SIZE = { width: 0, height: 0 }

export const JournalingSequenceView = ({
  backgroundProps,
  BackgroundDrawing,
  PreambleDrawing,
  introLines,
  IntroDrawing,
  onFinished
}: JournalingSequenceProps) => {
  const [size, setSize] = useState<SkSize>(EMPTY_SIZE)
  const insets = useSafeAreaInsets()
  const [isShowingPreamble, setIsShowingPreamble] = useState(true)
  const [isShowingIntro, setIsShowingIntro] = useState(false)
  const [isShowingJournalTime, setIsShowingJournalTime] = useState(false)
  const introOpacity = useSharedValue(0)
  const { sound: windSound } = useSFX(require("../assets/audio/calm.mp3"))
  useEffect(() => {
    if (windSound) windSound.playAsync()
    return () => {
      windSound?.stopAsync()
    }
  }, [windSound])
  return (
    <View style={styles.container}>
      <Canvas
        style={styles.canvas}
        onLayout={(e) => setSize(e.nativeEvent.layout)}
      >
        <Group opacity={useDerivedValue(() => 1 - introOpacity.value)}>
          <BackgroundDrawing
            background={backgroundProps}
            size={size}
            edgeInsets={insets}
          />
        </Group>
        {size !== EMPTY_SIZE && isShowingPreamble && (
          <PreambleDrawing
            onJournalTimeStarted={() => {
              setIsShowingJournalTime(true)
            }}
            edgeInsets={insets}
            size={size}
          />
        )}
        {isShowingIntro && (
          <IntroDrawing
            size={size}
            edgeInsets={insets}
            opacity={introOpacity}
          />
        )}
      </Canvas>
      {isShowingJournalTime && (
        <JournalTime
          onFinished={() => {
            introOpacity.value = withTiming(1, { duration: 500 })
            setIsShowingIntro(true)
            setIsShowingPreamble(false)
          }}
        />
      )}
      {isShowingIntro && (
        <IntroView lines={introLines} onFinished={onFinished} />
      )}
    </View>
  )
}

const JournalTime = ({ onFinished }: UseJournalTimeEnvironment) => {
  const journalTime = useJournalTime({ onFinished })
  return (
    <JournalTimeView
      state={journalTime}
      style={{ justifyContent: "center", flex: 1, padding: 24 }}
    />
  )
}

const IntroView = ({ onFinished, lines }: UseJournalingIntroEnvironment) => {
  const journalIntro = useJournalingIntro({ lines, onFinished })
  const padding = useScreenBottomPadding({
    safeAreaScreens: 64,
    nonSafeAreaScreens: 24
  })
  return (
    <JournalingIntroView
      state={journalIntro}
      style={[styles.intro, { paddingBottom: padding }]}
    />
  )
}

const styles = StyleSheet.create({
  intro: {
    justifyContent: "flex-end",
    flex: 1,
    paddingHorizontal: 24
  },
  container: { position: "relative", flex: 1 },
  canvas: { position: "absolute", height: "100%", width: "100%" }
})
