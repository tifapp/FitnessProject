import { Ionicon } from "@components/common/Icons"
import React from "react"
import { ImageBackground, StyleSheet, Text, View } from "react-native"

const MARKER_SIZE = 44

export type EventMarkerProps = {
  color: string
  attendeeCount: number
}

export const EventMarkerView = ({ color, attendeeCount }: EventMarkerProps) => {
  return (
    <>
      <View
        style={[
          styles.badgeDisplay,
          {
            backgroundColor: color
          }
        ]}
      >
        <Ionicon name="people" color="white" size={10} />
        <Text style={styles.badgeText}>{attendeeCount}</Text>
      </View>

      <View style={styles.whiteBackground}>
        <ImageBackground
          source={require("../../assets/Windows_10_Default_Profile_Picture.svg.png")}
          style={styles.imageBackground}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  whiteBackground: {
    zIndex: 1,
    flex: 1,
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    backgroundColor: "white",
    borderRadius: MARKER_SIZE / 2,
    alignItems: "center",
    overflow: "hidden"
  },
  imageBackground: {
    flex: 1,
    marginTop: "6%",
    marginRight: "1%",
    position: "absolute",
    width: MARKER_SIZE - 5,
    height: MARKER_SIZE - 5,
    borderRadius: MARKER_SIZE - 5 / 2,
    alignSelf: "center",
    overflow: "hidden"
  },
  badgeDisplay: {
    zIndex: 2,
    flex: 1,
    marginLeft: 15,
    paddingVertical: 3,
    paddingHorizontal: 5,
    backgroundColor: "red",
    position: "absolute",
    borderRadius: 7,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "scroll"
  },
  badgeText: {
    alignSelf: "stretch",
    textAlign: "center",
    paddingHorizontal: 3,
    fontWeight: "bold",
    fontSize: 8,
    color: "white",
    fontFamily: "OpenSansBold"
  }
})
