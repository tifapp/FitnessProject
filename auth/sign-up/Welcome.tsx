import { BodyText, Title } from "@components/Text"
import { PrimaryButton } from "@components/common/Buttons"
import { Ionicon, IoniconName } from "@components/common/Icons"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { ScrollView } from "react-native-gesture-handler"

export type WelcomeProps = {
  style?: StyleProp<ViewStyle>
}

export const WelcomeView = ({ style }: WelcomeProps) => {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
      >
        <Title>Welcome to tiF!</Title>
        <View style={styles.illustration} />
        <FeatureLabel
          iconName="notifications"
          title="Enable Notifications"
          description="Be notified about events, friend requests, messages, and more when notifications are turned on!"
        />
        <FeatureLabel
          iconName="notifications"
          title="Join Events"
          description="Forge everlasting bonds and embark on limitless ventures by working out with others in your area!"
        />
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton title="Awesome!" style={styles.nextButton} />
      </View>
    </View>
  )
}

type FeatureLabelProps = {
  iconName: IoniconName
  title: string
  description: string
  style?: StyleProp<ViewStyle>
}

const FeatureLabel = ({
  iconName,
  title,
  description,
  style
}: FeatureLabelProps) => (
  <View style={[styles.featureLabelContainer, style]}>
    <Ionicon name={iconName} style={styles.featureLabelIcon} />
    <View style={styles.featureLabelTextContainer}>
      <Title>{title}</Title>
      <BodyText style={styles.featureLabelBodyText}>{description}</BodyText>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1
  },
  footer: {
    position: "absolute",
    width: "100%",
    flex: 1,
    backgroundColor: "white",
    bottom: 0,
    padding: 16
  },
  bodyText: {
    opacity: 0.5,
    marginBottom: 24
  },
  scrollView: {
    flex: 1
  },
  scrollContainer: {
    padding: 16
  },
  nextButton: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 8
  },
  illustration: {
    height: 200,
    backgroundColor: "red"
  },
  featureLabelContainer: {
    display: "flex",
    flexDirection: "row"
  },
  featureLabelIcon: {
    marginRight: 8
  },
  featureLabelTextContainer: {
    flex: 1
  },
  featureLabelBodyText: {
    opacity: 0.5
  }
})
