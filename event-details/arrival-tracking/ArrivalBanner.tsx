import { BodyText, Subtitle } from "@components/Text"
import { TouchableIonicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors } from "@lib/Fonts"
import { ceilDurationToUnit, dayjs } from "@date-time"
import React from "react"
import { View, ViewStyle, StyleSheet } from "react-native"
import Animated, {
  AnimatedStyleProp,
  FadeIn,
  FadeOut
} from "react-native-reanimated"

/**
 * Data needed to display the countdown on the {@link EventArrivalBannerView}.
 *
 * The value of this type differs on 3 primary cases:
 * 1. If the event starts within an hour `secondsToStart` is used.
 * 2. If the event is over an hour away starting, but starts either today or tomorrow then `day` is used.
 * 3. If the event start time if more than 2 days away `secondsToStart` is used.
 */
export type EventArrivalBannerCountdown =
  | {
      day: "today" | "tomorrow"
    }
  | { secondsToStart: number }

export type EventArrivalBannerProps = {
  hasJoinedEvent: boolean
  canShareArrivalStatus: boolean
  countdown: EventArrivalBannerCountdown
  onClose: () => void
  style?: AnimatedStyleProp<ViewStyle>
}

/**
 * A banner to display when the user has arrived at an event.
 *
 * The banner fades in and out automatically.
 */
export const EventArrivalBannerView = ({
  hasJoinedEvent,
  countdown,
  canShareArrivalStatus,
  style,
  onClose
}: EventArrivalBannerProps) => {
  const othersKey = othersStatementKey(
    countdown,
    hasJoinedEvent,
    canShareArrivalStatus
  )
  const fomoKey = fomoStatementKey(countdown, hasJoinedEvent)
  const countdownText = countdownMessage(countdown)
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={style}>
      <View style={styles.container}>
        <View style={styles.outerRow}>
          <View style={styles.innerRow}>
            <View style={styles.alternativeIllustrationPlaceholder} />
            <View style={styles.textContainer}>
              <Subtitle
                style={styles.titleText}
                maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
              >
                {hasJoinedEvent ? "Welcome!" : "Join Now!"}
              </Subtitle>
              <BodyText
                style={styles.bodyText}
                maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
              >
                {`${countdownText}${OTHERS_STATEMENTS[othersKey]} ${FOMO_STATEMENTS[fomoKey]}`}
              </BodyText>
            </View>
          </View>
          <TouchableIonicon
            icon={{
              name: "close",
              maximumFontScaleFactor: FontScaleFactors.xxxLarge
            }}
            onPress={onClose}
            style={styles.closeIcon}
          />
        </View>
      </View>
    </Animated.View>
  )
}

const TEN_MINUTES_IN_SECONDS = dayjs.duration(10, "minutes").asSeconds()
const ONE_DAY_IN_SECONDS = dayjs.duration(1, "day").asSeconds()
const ONE_HOUR_IN_SECONDS = dayjs.duration(1, "hour").asSeconds()

const FOMO_STATEMENTS = {
  joinNow: "Join now or miss out on the epic fun!",
  laceUp: "Lace up for some epic fun!",
  gearUp: "Gear up for some epic fun!",
  spintOver: "Sprint over to the meeting point!"
}

export const fomoStatementKey = (
  countdown: EventArrivalBannerCountdown,
  hasJoinedEvent: boolean
): keyof typeof FOMO_STATEMENTS => {
  if (!hasJoinedEvent) {
    return "joinNow"
  } else if (
    "day" in countdown ||
    countdown.secondsToStart > ONE_DAY_IN_SECONDS
  ) {
    return "gearUp"
  } else if (countdown.secondsToStart < TEN_MINUTES_IN_SECONDS) {
    return "spintOver"
  } else {
    return "laceUp"
  }
}

const OTHERS_STATEMENTS = {
  othersNotified: " Others have been notified of your arrival.",
  othersEager: " Others are eager to meet you.",
  empty: ""
}

export const othersStatementKey = (
  countdown: EventArrivalBannerCountdown,
  hasJoinedEvent: boolean,
  canShareArrivalStatus: boolean
): keyof typeof OTHERS_STATEMENTS => {
  if (
    !hasJoinedEvent ||
    "day" in countdown ||
    countdown.secondsToStart > ONE_HOUR_IN_SECONDS
  ) {
    return "empty"
  }
  return canShareArrivalStatus ? "othersNotified" : "othersEager"
}

export const countdownMessage = (countdown: EventArrivalBannerCountdown) => {
  if ("day" in countdown) {
    return `This event kicks off ${countdown.day}.`
  } else if (countdown.secondsToStart <= 0) {
    return "This event is underway."
  } else if (countdown.secondsToStart < TEN_MINUTES_IN_SECONDS) {
    return "This event kicks off in under 10 minutes."
  } else if (countdown.secondsToStart < ONE_HOUR_IN_SECONDS) {
    return "This event kicks off in under an hour."
  } else {
    const countdownText = humanizeCountdownSeconds(countdown.secondsToStart)
    return `This event kicks off in ${countdownText}.`
  }
}

const humanizeCountdownSeconds = (countdownSeconds: number) => {
  const duration = dayjs.duration(countdownSeconds, "seconds")
  // NB: Dayjs formats weeks as days (eg. 1 week -> 7-13 days), so this conversion must be done manually.
  if (duration.asWeeks() === 1) {
    return "a week"
  } else if (duration.asWeeks() > 1 && duration.asWeeks() < 4) {
    return `${Math.ceil(duration.asWeeks())} weeks`
  } else if (duration.asWeeks() < 1) {
    return ceilDurationToUnit(duration, "days").humanize()
  } else {
    return ceilDurationToUnit(duration, "months").humanize()
  }
}

const styles = StyleSheet.create({
  outerRow: {
    display: "flex",
    flexDirection: "row"
  },
  innerRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  alternativeIllustrationPlaceholder: {
    backgroundColor: "red",
    height: 64,
    width: 64,
    marginRight: 8
  },
  textContainer: {
    flex: 1
  },
  titleText: {
    marginBottom: 4
  },
  bodyText: {
    opacity: 0.5
  },
  closeIcon: {
    opacity: 0.35,
    transform: [{ translateX: 4 }]
  },
  container: {
    backgroundColor: AppStyles.eventCardColor,
    padding: 16,
    borderRadius: 12,
    width: "100%"
  }
})
