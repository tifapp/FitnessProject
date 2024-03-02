import { dayjs, now } from "@date-time"
import { useAutocorrectingInterval } from "@lib/utils/UseInterval"
import { CurrentUserEvent } from "@shared-models/Event"
import { TodayOrTomorrow } from "@shared-models/TodayOrTomorrow"
import { useState } from "react"
import { humanizeEventCountdownSeconds } from "./Event"
import { StyleProp, ViewStyle, View, StyleSheet } from "react-native"
import { BodyText, Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors, useFontScale } from "@lib/Fonts"
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

/**
 * A hook that computes the formatted countdown timer for the event.
 */
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

/**
 * Displays the countdown for an event.
 */
export const EventCountdownView = ({ result, style }: EventCountdownProps) => (
  <View style={style}>
    {result.status === "starts-in" && (
      <CountdownLabel
        title="Starts in"
        todayOrTomorrowTitle="Starts"
        countdown={result.countdown}
        shouldDisplayFomoEffect={result.countdown.shouldDisplayFomoEffect}
      />
    )}
    {result.status === "ends-in" && (
      <CountdownLabel
        title="Ends in"
        todayOrTomorrowTitle="Ends"
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
    <BodyText
      maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
      style={styles.titleText}
    >
      {"todayOrTomorrow" in countdown ? todayOrTomorrowTitle : title}
    </BodyText>
    <View
      style={[
        styles.countdownTextContainerContainer,
        {
          height:
            48 * useFontScale({ maximumScaleFactor: FontScaleFactors.xxxLarge })
        }
      ]}
    >
      <View style={styles.countdownTextContainer}>
        <Headline
          maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
          style={[
            styles.countdownText,
            {
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
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: AppStyles.eventCardColor
  },
  countdownText: {
    paddingHorizontal: 16,
    textAlign: "center"
  },
  titleText: {
    paddingLeft: 8
  },
  countdownTextContainerContainer: {
    display: "flex",
    flexDirection: "row"
  },
  countdownTextSpacer: {
    flex: 1
  }
})
