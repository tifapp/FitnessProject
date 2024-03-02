import { dayjs, now } from "@date-time"
import { useAutocorrectingInterval } from "@lib/utils/UseInterval"
import { CurrentUserEvent } from "@shared-models/Event"
import { TodayOrTomorrow } from "@shared-models/TodayOrTomorrow"
import { useState } from "react"
import { humanizeEventCountdownSeconds } from "./Event"
import { StyleProp, ViewStyle, View, StyleSheet } from "react-native"
import { Caption, Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { useFontScale } from "@lib/Fonts"
import { StringUtils } from "@lib/utils/String"

export type EventCountdownTime = CurrentUserEvent["time"]

const eventSecondsToStart = (time: EventCountdownTime) => {
  const offset = now().diff(dayjs(time.clientReceivedTime))
  return time.secondsToStart - Math.round(offset / 1000)
}

export type UseEventCountdownResult =
  | {
      status: "starts-in" | "ends-in"
      countdown: EventFormattedCountdown
    }
  | { status: "done" }

export const useEventCountdown = (
  time: EventCountdownTime
): UseEventCountdownResult => {
  const [secondsToStart, setSecondsToStart] = useState(
    eventSecondsToStart(time)
  )
  useAutocorrectingInterval(
    () => setSecondsToStart(eventSecondsToStart(time)),
    1000
  )
  if (secondsToStart > 0) {
    return {
      status: "starts-in",
      countdown: formatEventCountdownSeconds(
        secondsToStart,
        time.todayOrTomorrow
      )
    }
  }
  const { seconds } = time.dateRange.diff
  const secondsToEnd = seconds - Math.abs(secondsToStart)
  const countdown = formatEventCountdownSeconds(
    secondsToEnd,
    time.todayOrTomorrow
  )
  return secondsToEnd <= 0
    ? { status: "done" }
    : { status: "ends-in", countdown }
}

export type EventFormattedCountdown =
  | { todayOrTomorrow: "Today" | "Tomorrow"; shouldDisplayFomoEffect: false }
  | { formatted: string; shouldDisplayFomoEffect: boolean }

const formatEventCountdownSeconds = (
  seconds: number,
  todayOrTomorrow: TodayOrTomorrow | null
): EventFormattedCountdown => {
  const duration = dayjs.duration(seconds, "second")
  const formatted = humanizeEventCountdownSeconds(seconds).replace(
    /(a|an) /,
    "1 "
  )
  const shouldDisplayFomoEffect = duration.asMinutes() <= 15
  if (
    (duration.asHours() >= 1 && duration.asHours() <= 6) ||
    !todayOrTomorrow
  ) {
    return { formatted, shouldDisplayFomoEffect }
  } else if (duration.asHours() < 1) {
    const seconds = Math.floor(duration.asSeconds() % 60)
    const minutes = Math.floor(duration.asMinutes())
    return {
      formatted: formatMinuteAndSecond(minutes, seconds),
      shouldDisplayFomoEffect
    }
  } else {
    return {
      todayOrTomorrow: StringUtils.capitalizeFirstLetter(todayOrTomorrow),
      shouldDisplayFomoEffect: false
    }
  }
}

const formatMinuteAndSecond = (left: number, right: number) => {
  return `${left}:${right < 10 ? `0${right}` : right}`
}

export type EventCountdownProps = {
  result: UseEventCountdownResult
  style?: StyleProp<ViewStyle>
}

export const EventCountdownView = ({ result, style }: EventCountdownProps) => (
  <View style={style}>
    {result.status === "starts-in" && (
      <CountdownLabel
        title="Event starts in"
        todayOrTomorrowTitle="Event starts"
        countdown={result.countdown}
        shouldDisplayFomoEffect={result.countdown.shouldDisplayFomoEffect}
      />
    )}
    {result.status === "ends-in" && (
      <CountdownLabel
        title="Event ends in"
        todayOrTomorrowTitle="Event ends"
        countdown={result.countdown}
        shouldDisplayFomoEffect={result.countdown.shouldDisplayFomoEffect}
      />
    )}
  </View>
)

type CountdownLabelProps = {
  title: string
  todayOrTomorrowTitle: string
  countdown: EventFormattedCountdown
  shouldDisplayFomoEffect: boolean
}

const CountdownLabel = ({
  title,
  todayOrTomorrowTitle,
  countdown,
  shouldDisplayFomoEffect
}: CountdownLabelProps) => (
  <View style={styles.container}>
    <Caption>
      {"todayOrTomorrow" in countdown ? todayOrTomorrowTitle : title}
    </Caption>
    <View style={styles.countdownTextContainerContainer}>
      <View style={styles.countdownTextContainer}>
        <Headline
          style={[
            styles.countdownText,
            {
              minWidth: 100 * useFontScale(),
              color: shouldDisplayFomoEffect ? AppStyles.errorColor : "black"
            }
          ]}
        >
          {"formatted" in countdown
            ? countdown.formatted
            : countdown.todayOrTomorrow}
        </Headline>
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    rowGap: 4
  },
  countdownTextContainer: {
    display: "flex",
    flexDirection: "row",
    borderRadius: 12,
    backgroundColor: AppStyles.eventCardColor
  },
  countdownText: {
    padding: 8,
    textAlign: "center"
  },
  countdownTextContainerContainer: {
    display: "flex",
    flexDirection: "row"
  },
  countdownTextSpacer: {
    flex: 1
  }
})
