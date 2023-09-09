import { AuthSectionView } from "@auth/AuthSection"
import { BodyText, Subtitle } from "@components/Text"
import { CircularIonicon, IoniconName } from "@components/common/Icons"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export type SignUpEndingProps = {
  style?: StyleProp<ViewStyle>
}

/**
 * The view that shows to the user at the end of the sign-up flow.
 */
export const SignUpEndingView = ({ style }: SignUpEndingProps) => {
  return (
    <AuthSectionView
      title="Welcome to tiF!"
      description="Way to get started on your fitness journey! See below for what to do with your new account!"
      callToActionTitle="Awesome!"
      style={style}
    >
      <View style={styles.illustration} />
      <FeatureLabel
        iconName="people"
        iconColor="#F76F8E"
        title="Join Events"
        description="Forge everlasting bonds and embark on limitless ventures by working out with others in your area!"
      />
      <FeatureLabel
        iconName="notifications"
        iconColor="#E9D758"
        title="Enable Notifications"
        description="Be notified about events, friend requests, messages, and more when notifications are turned on!"
        style={styles.notificationsLabel}
      />
    </AuthSectionView>
  )
}

type FeatureLabelProps = {
  iconName: IoniconName
  iconColor: string
  title: string
  description: string
  style?: StyleProp<ViewStyle>
}

const FeatureLabel = ({
  iconName,
  iconColor,
  title,
  description,
  style
}: FeatureLabelProps) => (
  <View style={[styles.featureLabelContainer, style]}>
    <CircularIonicon
      backgroundColor={iconColor}
      name={iconName}
      style={styles.featureLabelIcon}
    />
    <View style={styles.featureLabelTextContainer}>
      <Subtitle>{title}</Subtitle>
      <BodyText style={styles.featureLabelBodyText}>{description}</BodyText>
    </View>
  </View>
)

const styles = StyleSheet.create({
  illustration: {
    height: 200,
    backgroundColor: "red",
    marginBottom: 24
  },
  notificationsLabel: {
    marginTop: 16
  },
  featureLabelContainer: {
    display: "flex",
    flexDirection: "row"
  },
  featureLabelIcon: {
    marginRight: 8,
    maxHeight: 32
  },
  featureLabelTextContainer: {
    flex: 1
  },
  featureLabelBodyText: {
    opacity: 0.5
  }
})
