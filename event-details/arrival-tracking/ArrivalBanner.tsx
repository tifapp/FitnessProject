import { BodyText, Subtitle } from "@components/Text"
import { TouchableIonicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { FontScaleFactors } from "@lib/Fonts"
import React from "react"
import { View, ViewStyle, StyleSheet } from "react-native"
import Animated, {
  AnimatedStyleProp,
  FadeIn,
  FadeOut
} from "react-native-reanimated"

/**
 * The arrival banner message theme consists of a simple title and description
 * that let the user know that they've arrived at an event in a given context.
 *
 * This "context" is determined by 3 factors:
 * - Has the user joined the event?
 * - When did the user arrive relative to the event start time?
 * - Does the user share their arrival status with others?
 *
 * The first 2 points determine the `kind` field, which is a simple string that
 * keys into an object of the actual messages to display.
 *
 * The last one determines whether or not to display an alternate description if
 * the user has decided to disable sharing their arrival status with others for
 * privacy reasons.
 */
export type EventArrivalBannerMessageTheme = {
  // eslint-disable-next-line no-use-before-define
  kind: keyof typeof ARRIVAL_BANNER_MESSAGES
  isUsingAlternativeDescription: boolean
}

export type EventArrivalBannerProps = {
  messageTheme: EventArrivalBannerMessageTheme
  onClose: () => void
  style?: AnimatedStyleProp<ViewStyle>
}

/**
 * A banner to display when the user has arrived at an event.
 *
 * The contents of the arrival banner fade in and out automatically, so this shouldn't
 * need to be wrapped inside an `Animated.View`.
 */
export const EventArrivalBannerView = ({
  messageTheme: { kind, isUsingAlternativeDescription },
  style,
  onClose
}: EventArrivalBannerProps) => (
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
              {ARRIVAL_BANNER_MESSAGES[kind].title}
            </Subtitle>
            <BodyText
              style={styles.bodyText}
              maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
            >
              {isUsingAlternativeDescription
                ? ARRIVAL_BANNER_MESSAGES[kind].altDescription
                : ARRIVAL_BANNER_MESSAGES[kind].description}
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

const ARRIVAL_BANNER_MESSAGES = {
  joinedEventArrivedOnTime: {
    title: "You've Arrived!",
    description:
      "We've let everyone else know that you're here. Have fun and make new friends!",
    altDescription: "TBD"
  },
  joinedEventArrivedWhenOngoing: {
    title: "You've Died!",
    description: "This message is still being decided!",
    altDescription: "TBD"
  },
  joinedEventArrivedEarly: {
    title: "You're Early!",
    description: "This message is still being decided!",
    altDescription: "TBD"
  },
  joinedEventArrivedInSameDayAsEventStart: {
    title: "TBD",
    description: "TBD",
    altDescription: "TBD"
  },
  joinedEventArrivedMoreThanADayBeforeEventStart: {
    title: "TBD",
    description: "TBD",
    altDescription: "TBD"
  },
  notJoinedEventArrivedOnTime: {
    title: "TBD",
    description: "TBD",
    altDescription: "TBD"
  },
  notJoinedEventArrivedWhenOngoing: {
    title: "TBD",
    description: "TBD",
    altDescription: "TBD"
  },
  notJoinedEventArrivedEarly: {
    title: "TBD",
    description: "TBD",
    altDescription: "TBD"
  },
  notJoinedEventArrivedInSameDayAsEventStart: {
    title: "TBD",
    description: "TBD",
    altDescription: "TBD"
  },
  notJoinedEventArrivedMoreThanADayBeforeEventStart: {
    title: "TBD",
    description: "TBD",
    altDescription: "TBD"
  }
} as const

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
