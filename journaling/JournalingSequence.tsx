import { Canvas, SkSize } from "@shopify/react-native-skia"
import { MoonBackgroundProps } from "./MoonBackground"
import { SunBackgroundProps } from "./SunBackground"
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context"
import React, { useState } from "react"
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

export type BackgroundProps = SunBackgroundProps | MoonBackgroundProps

export type PreambleProps = {
  onJournalTimeStarted: () => void
  size: SkSize
  edgeInsets: EdgeInsets
}

export type IntroDrawingProps = {
  size: SkSize
  edgeInsets: EdgeInsets
}

export type JournalingSequenceProps = {
  backgroundProps: BackgroundProps["background"]
  BackgroundDrawing: (props: BackgroundProps) => JSX.Element
  PreambleDrawing: (props: PreambleProps) => JSX.Element
  introLines: keyof typeof PRAGMA_LINES
  IntroDrawing: (props: IntroDrawingProps) => JSX.Element
  onFinished: () => void
}

export const JournalingSequenceView = ({
  backgroundProps,
  BackgroundDrawing,
  PreambleDrawing,
  introLines,
  IntroDrawing,
  onFinished
}: JournalingSequenceProps) => {
  const [size, setSize] = useState<SkSize>({ width: 0, height: 0 })
  const insets = useSafeAreaInsets()
  const [isShowingPreamble, setIsShowingPreamble] = useState(true)
  const [isShowingIntro, setIsShowingIntro] = useState(false)
  const [isShowingJournalTime, setIsShowingJournalTime] = useState(false)
  return (
    <View style={styles.container}>
      <Canvas
        style={styles.canvas}
        onLayout={(e) => setSize(e.nativeEvent.layout)}
      >
        <BackgroundDrawing
          background={backgroundProps}
          size={size}
          edgeInsets={insets}
        />
        {isShowingPreamble && (
          <PreambleDrawing
            onJournalTimeStarted={() => {
              setIsShowingJournalTime(true)
            }}
            edgeInsets={insets}
            size={size}
          />
        )}
        {isShowingIntro && <IntroDrawing size={size} edgeInsets={insets} />}
      </Canvas>
      {isShowingJournalTime && (
        <JournalTime
          onFinished={() => {
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
  return <JournalingIntroView state={journalIntro} style={styles.intro} />
}

const styles = StyleSheet.create({
  intro: {
    justifyContent: "flex-end",
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 64
  },
  container: { position: "relative", flex: 1 },
  canvas: { position: "absolute", height: "100%", width: "100%" }
})
