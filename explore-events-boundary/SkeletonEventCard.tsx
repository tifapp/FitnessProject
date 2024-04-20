import { SkeletonView } from "@components/common/Skeleton"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export type SkeletonEventCardProps = {
  style?: StyleProp<ViewStyle>
}

export const SkeletonEventCard = ({ style }: SkeletonEventCardProps) => (
  <View style={style}>
    <View style={styles.profileRow}>
      <SkeletonView style={styles.profileImage} />
      <View style={styles.profileTextContainer}>
        <SkeletonView style={styles.profileName} />
        <SkeletonView style={styles.profileHandle} />
      </View>
    </View>
    <SkeletonView style={styles.eventDescriptionLine} />
    <SkeletonView style={styles.eventDescriptionLine} />
    <SkeletonView style={styles.eventDescriptionLastLine} />
  </View>
)

const styles = StyleSheet.create({
  profileRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  profileTextContainer: {
    marginLeft: 16
  },
  profileName: {
    width: 128,
    height: 16
  },
  profileHandle: {
    height: 12,
    width: 96,
    marginTop: 4
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 128
  },
  eventDescriptionLine: {
    width: "100%",
    height: 16,
    marginTop: 4
  },
  eventDescriptionLastLine: {
    width: "75%",
    height: 16,
    marginTop: 4
  }
})
