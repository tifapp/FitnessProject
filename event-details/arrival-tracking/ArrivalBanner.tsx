import { SecondaryOutlinedButton } from "@components/Buttons"
import { BodyText, Subtitle } from "@components/Text"
import { TouchableIonicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
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
      <View style={styles.illustrationRow}>
        <View style={styles.illustrationPlaceholder} />
        <TouchableIonicon
          icon={{ name: "close" }}
          onPress={onClose}
          style={styles.closeIcon}
        />
      </View>
      <Subtitle style={styles.titleText}>You&apos;ve Arrived!</Subtitle>
      <BodyText style={styles.bodyText}>
        We&apos;ve let everyone else know that you&apos;re here. Have fun and
        make new friends!
      </BodyText>
      <SecondaryOutlinedButton onPress={onClose} style={styles.gotItButton}>
        Got it!
      </SecondaryOutlinedButton>
    </View>
  </Animated.View>
)

const styles = StyleSheet.create({
  illustrationRow: {
    display: "flex",
    flexDirection: "row"
  },
  illustrationPlaceholder: {
    backgroundColor: "red",
    height: 100,
    flex: 1
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
  },
  titleText: {
    textAlign: "center",
    marginVertical: 8
  },
  bodyText: {
    opacity: 0.5,
    textAlign: "center"
  },
  gotItButton: {
    width: "100%",
    marginTop: 16
  }
})
