import { CaptionTitle } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import React from "react"
import {
  ImageBackground,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"

const MARKER_SIZE = 44

export type ExploreEventsMarkerProps = {
  color: string
  attendeeCount: number
  style?: StyleProp<ViewStyle>
}

export const ExploreEventsMarkerView = ({
  color,
  attendeeCount,
  style
}: ExploreEventsMarkerProps) => {
  return (
    <View style={[style, styles.frame]}>
      <View style={styles.container}>
        <View style={styles.markerContainer}>
          <View style={[{ backgroundColor: color }, styles.badgeContainer]}>
            <Ionicon
              style={styles.badgeIcon}
              name="people"
              color="white"
              size={12}
            />
            <CaptionTitle style={styles.badgeText}>
              {attendeeCount}
            </CaptionTitle>
          </View>

          <View style={styles.whiteBackground}>
            <ImageBackground
              source={require("../../assets/Windows_10_Default_Profile_Picture.svg.png")}
              style={styles.imageBackground}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    width: 96,
    height: 64
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  markerContainer: {
    justifyContent: "center",
    alignItems: "center"
  },
  whiteBackground: {
    zIndex: 1,
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    backgroundColor: "white",
    borderRadius: 128,
    justifySelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  imageBackground: {
    width: MARKER_SIZE - 2,
    height: MARKER_SIZE - 2,
    borderRadius: 128,
    overflow: "hidden"
  },
  badgeContainer: {
    zIndex: 2,
    flex: 1,
    top: -8,
    right: -MARKER_SIZE / 2,
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
