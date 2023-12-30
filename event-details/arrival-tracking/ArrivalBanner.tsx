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

export type EventArrivalBannerProps = {
  onClose: () => void
  style?: AnimatedStyleProp<ViewStyle>
}

export const EventArrivalBannerView = ({
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
              You&apos;ve Arrived!
            </Subtitle>
            <BodyText
              style={styles.bodyText}
              maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
            >
              We&apos;ve let everyone else know that you&apos;re here. Have fun
              and make new friends!
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
    marginBottom: 8
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
