import { usePragmaQuote } from "@edit-event-boundary/PragmaQuotes"
import { useCallback, useEffect, useState } from "react"
import { useTrack } from "./Audio"
import { StyleProp, View, StyleSheet, ViewStyle, Pressable } from "react-native"
import { BodyText, Headline } from "@components/Text"

export const PRAGMA_LINES = {
  sunrise: [
    "Good morning Sean! Welcome to the next day!",
    "It appears that the sun is beginning to rise, will you enjoy it?",
    "In any case, it would do you well to remember this for today.",
    "Simulated disorder postulates perfect discipline, simulated fear postulates courage; simulated weakness postulates strength."
  ],
  midday: [
    "What brings you here today, Sean?",
    "The day seems to be well underway, are you ready for it?",
    "Yet, take this time to digest this before you reflect.",
    "According as circumstances are favorable, one should modify one’s plans."
  ],
  sunset: [
    "It seems that the day is coming to an end.",
    "Did you accomplish what came to you today, Sean?",
    "Regardless, it would be wise to process this while reflecting on your day.",
    "When it was to their advantage, they made a forward move; when otherwise, they stopped still."
  ],
  night: [
    "What brings you here at this time of night, Sean?",
    "Tomorrow seems to be coming closer, what do you have in mind?",
    "It seems that you should consider this in that case.",
    "Knowing the place and the time of the coming battle, we may concentrate from the greatest distances in order to fight."
  ],
  reallyLateNight: [
    "It seems that you have been very naughty with your sleep schedule Sean.",
    "I'm very disappointed in you Sean, please go to bed.",
    "However, I would like you to internalize this before that.",
    "Victorious warriors win first and then go to war, while defeated warriors go to war first and then seek to win."
  ],
  bullying: [
    "Fuck You Sean.",
    "🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕",
    "I hope you die, so I'm not even going to leave you with advice this time.",
    "I am hereby sending you to TiF Hell.",
    "Goodbye, Sean. You were so pathetic, but thanks for leaving us with your money.",
    "Now die you pathetic fucker."
  ]
}

export type UseJournalingIntroEnvironment = {
  lines: keyof typeof PRAGMA_LINES
  onFinished: () => void
}

export const useJournalingIntro = ({
  lines,
  onFinished
}: UseJournalingIntroEnvironment) => {
  const { sound } = useTrack(require("../assets/audio/journaling-theme.mp3"), {
    volume: 0.6
  })
  const [line, setLine] = useState(0)
  const text = usePragmaQuote(
    useCallback(() => PRAGMA_LINES[lines][line], [lines, line]),
    5,
    0
  )
  useEffect(() => {
    if (sound) {
      sound.playAsync()
    }
    return () => {
      sound?.stopAsync()
    }
  }, [sound])
  return {
    text,
    lineAdvanced: () => {
      setLine((l) => {
        const next = l + 1
        if (next >= PRAGMA_LINES[lines].length) {
          sound?.stopAsync()
          onFinished()
          return l
        }
        return next
      })
    }
  }
}

export type JournalingIntroProps = {
  state: ReturnType<typeof useJournalingIntro>
  style?: StyleProp<ViewStyle>
}

export const JournalingIntroView = ({ state, style }: JournalingIntroProps) => (
  <View style={style}>
    <Pressable onPress={state.lineAdvanced}>
      <View style={styles.container}>
        <View style={styles.text}>
          <Headline>Pragma</Headline>
          <BodyText>{state.text}</BodyText>
        </View>
      </View>
    </Pressable>
  </View>
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12
  },
  text: {
    rowGap: 8,
    padding: 16,
    height: 200
  }
})
