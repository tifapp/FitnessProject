import { dayjs, diffDates } from "@date-time"
import { useInterval } from "@lib/utils/UseInterval"
import { CurrentUserEvent } from "@shared-models/Event"
import { TodayOrTomorrow } from "@shared-models/TodayOrTomorrow"
import { useState } from "react"
import { humanizeEventCountdownSeconds } from "./Event"
import { StringUtils } from "@lib/utils/String"
import {
  StyleProp,
  ViewStyle,
  View,
  StyleSheet,
  LayoutRectangle
} from "react-native"
import { Caption, Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { duration } from "dayjs"

export type EventCountdownTime = CurrentUserEvent["time"]

const initialSecondsToStart = (time: EventCountdownTime) => {
  const { seconds } = diffDates(new Date(), time.clientReceivedTime)
  return time.secondsToStart - seconds
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
    initialSecondsToStart(time)
  )
  useInterval(() => setSecondsToStart((s) => s - 1), 1000)
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
  | { todayOrTomorrow: "Today" | "Tomorrow" }
  | { formatted: string }

const formatEventCountdownSeconds = (
  seconds: number,
  todayOrTomorrow: TodayOrTomorrow | null
): EventFormattedCountdown => {
  const duration = dayjs.duration(seconds, "second")
  const formatted = humanizeEventCountdownSeconds(seconds).replace(
    /(a|an) /,
    "1 "
  )
  if (todayOrTomorrow === "today" && duration.asHours() > 6) {
    return { todayOrTomorrow: "Today" }
  } else if (todayOrTomorrow === "tomorrow") {
    return { todayOrTomorrow: "Tomorrow" }
  } else if (duration.asHours() < 1) {
    const seconds = Math.floor(duration.asSeconds() % 60)
    const minutes = Math.floor(duration.asMinutes())
    return formatMinuteAndSecond(minutes, seconds)
  } else {
    return { formatted }
  }
}

const formatMinuteAndSecond = (left: number, right: number) => {
  return { formatted: `${left}:${right < 10 ? `0${right}` : right}` }
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
      />
    )}
    {result.status === "ends-in" && (
      <CountdownLabel
        title="Event ends in"
        todayOrTomorrowTitle="Event ends"
        countdown={result.countdown}
      />
    )}
  </View>
)

type CountdownLabelProps = {
  title: string
  todayOrTomorrowTitle: string
  countdown: EventFormattedCountdown
}

const CountdownLabel = ({
  title,
  todayOrTomorrowTitle,
  countdown
}: CountdownLabelProps) => {
  const [captionRect, setCaptionRect] = useState<LayoutRectangle | undefined>()
  return (
    <View style={styles.container}>
      <Caption onLayout={(e) => setCaptionRect(e.nativeEvent.layout)}>
        {"todayOrTomorrow" in countdown ? todayOrTomorrowTitle : title}
      </Caption>
      <View style={styles.countdownTextContainerContainer}>
        <View style={styles.countdownTextContainer}>
          <Headline
            style={[
              styles.countdownText,
              { minWidth: captionRect?.width ?? 0 }
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
}

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
