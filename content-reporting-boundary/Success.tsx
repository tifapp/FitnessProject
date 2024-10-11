import { BodyText, Headline } from "@components/Text"
import { PrimaryButton } from "@components/Buttons"
import { Ionicon } from "@components/common/Icons"
import React from "react"
import {
  SafeAreaView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"

export type ReportSuccessProps = {
  onDoneTapped: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * A view to indicate that a piece of content was successfully reported.
 */
export const ReportSuccessView = ({
  onDoneTapped,
  style
}: ReportSuccessProps) => (
  <SafeAreaView style={[style, styles.container]}>
    <View style={styles.centerContainer}>
      <Ionicon name="thumbs-up" size={64} />
      <Headline style={styles.title}>Thanks for letting us know</Headline>
      <BodyText style={styles.bodyText}>
        Your input helps us keep fitness communities safe.
      </BodyText>
    </View>
    <View style={styles.doneButtonContainer}>
      <PrimaryButton onPress={onDoneTapped} style={styles.doneButton}>
        Done
      </PrimaryButton>
    </View>
  </SafeAreaView>
)

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1
  },
  doneButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  doneButton: {
    width: "100%"
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  title: {
    textAlign: "center",
    marginVertical: 8
  },
  bodyText: {
    textAlign: "center",
    opacity: 0.5,
    maxWidth: "75%"
  }
})
