import {
  AVATAR_MARKER_SIZE,
  AvatarMapMarkerView
} from "@components/AvatarMapMarker"
import { CaptionTitle } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import React, { memo } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export type ExploreEventsMarkerProps = {
  color: string
  attendeeCount: number
  hostName: string
  imageURL?: string
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsMarkerView = ({
  color,
  attendeeCount,
  hostName,
  imageURL,
  style
}: ExploreEventsMarkerProps) => (
  <AvatarMapMarkerView name={hostName} imageURL={imageURL} style={style}>
    <View style={[{ backgroundColor: color }, styles.badgeContainer]}>
      <Ionicon style={styles.badgeIcon} name="people" color="white" size={12} />
      <CaptionTitle style={styles.badgeText}>{attendeeCount}</CaptionTitle>
    </View>
  </AvatarMapMarkerView>
)

const styles = StyleSheet.create({
  badgeContainer: {
    zIndex: 2,
    flex: 1,
    top: -8,
    right: -AVATAR_MARKER_SIZE / 2,
    padding: 4,
    position: "absolute",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "scroll"
  },
  badgeIcon: {
    marginLeft: 4
  },
  badgeText: {
    marginLeft: 4,
    marginRight: 4,
    color: "white"
  }
})
