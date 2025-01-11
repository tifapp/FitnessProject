import { ClientSideEvent } from "@event/ClientSideEvent"
import { formattedEventCountdownSeconds } from "./SharedCountdownFormatting"
import { StyleProp, ViewStyle, View, StyleSheet } from "react-native"
import { Footnote, Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors, useFontScale } from "@lib/Fonts"
import { dayjs } from "TiFShared/lib/Dayjs"
import { capitalizeFirstLetter } from "TiFShared/lib/String"
import { FixedDateRange } from "TiFShared/domain-models/FixedDateRange"
import { TodayOrTomorrow } from "TiFShared/domain-models/TodayOrTomorrow"

export type EventCountdownTime = ClientSideEvent["time"]

export type EventCountdown =
  | {
      kind: "starts-in" | "ends-in"
      formatted: EventFormattedCountdown
    }
  | { kind: "done" }

export type EventFormattedCountdown =
  | { todayOrTomorrow: "Today" | "Tomorrow"; shouldDisplayFomoEffect: false }
  | { formatted: string; shouldDisplayFomoEffect: boolean }

export const eventCountdown = (
  secondsToStart: number,
  dateRange: FixedDateRange,
  todayOrTomorrow: TodayOrTomorrow | null
): EventCountdown => {
  if (secondsToStart > 0) {
    return {
      kind: "starts-in",
      formatted: eventFormattedCountdown(secondsToStart, todayOrTomorrow)
    }
  }
  const { seconds } = dateRange.diff
  const secondsToEnd = seconds - Math.abs(secondsToStart)
  const formatted = eventFormattedCountdown(secondsToEnd, todayOrTomorrow)
  return secondsToEnd <= 0 ? { kind: "done" } : { kind: "ends-in", formatted }
}

const eventFormattedCountdown = (
  seconds: number,
  todayOrTomorrow: TodayOrTomorrow | null
): EventFormattedCountdown => {
  const duration = dayjs.duration(seconds, "second")
  const formatted = formattedEventCountdownSeconds(seconds).replace(
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
      todayOrTomorrow: capitalizeFirstLetter(todayOrTomorrow),
      shouldDisplayFomoEffect: false
    }
  }
}

const formatMinuteAndSecond = (left: number, right: number) => {
  return `${left}:${right < 10 ? `0${right}` : right}`
}

export type EventCountdownProps = {
  countdown: EventCountdown
  style?: StyleProp<ViewStyle>
}

export const EventCountdownView = ({
  countdown,
  style
}: EventCountdownProps) => (
  <View style={style}>
    {countdown.kind === "starts-in" && (
      <CountdownLabel
        title="Starts in"
        todayOrTomorrowTitle="Starts"
        formattedCountdown={countdown.formatted}
      />
    )}
    {countdown.kind === "ends-in" && (
      <CountdownLabel
        title="Ends in"
        todayOrTomorrowTitle="Ends"
        formattedCountdown={countdown.formatted}
      />
    )}
  </View>
)

type CountdownLabelProps = {
  title: string
  todayOrTomorrowTitle: string
  formattedCountdown: EventFormattedCountdown
}

const CountdownLabel = ({
  title,
  todayOrTomorrowTitle,
  formattedCountdown
}: CountdownLabelProps) => (
  <View style={styles.container}>
    <Footnote
      maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
      style={styles.titleText}
    >
      {"todayOrTomorrow" in formattedCountdown ? todayOrTomorrowTitle : title}
    </Footnote>
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
              color: formattedCountdown.shouldDisplayFomoEffect
                ? AppStyles.errorColor
                : "black"
            }
          ]}
        >
          {"formatted" in formattedCountdown
            ? formattedCountdown.formatted
            : formattedCountdown.todayOrTomorrow}
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
    backgroundColor: "white"
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
