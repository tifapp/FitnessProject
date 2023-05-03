import { TouchableIonicon } from "@components/common/Icons"
import { ButtonStyles } from "@lib/ButtonStyle"
import { BlurView } from "expo-blur"
import React from "react"
import { StyleSheet, View } from "react-native"

export const EventTabBar = () => {
  const darkIconColor = "#1c1c1c"
  const iconSize = 24

  return (
    <BlurView intensity={100} tint="light" style={styles.blur}>
      <View style={styles.container}>
        <TouchableIonicon
          style={styles.icon}
          icon={{ name: "location", color: ButtonStyles.darkColor }}
        />
        <TouchableIonicon
          style={styles.icon}
          icon={{ name: "chatbox", color: ButtonStyles.darkColor }}
        />
        <TouchableIonicon
          style={styles.plusIcon}
          icon={{ name: "add-outline", color: "white" }}
        />
        <TouchableIonicon
          style={styles.icon}
          icon={{ name: "notifications", color: "grey" }}
        />
        <TouchableIonicon
          style={styles.icon}
          icon={{ name: "person", color: "grey" }}
        />
      </View>
    </BlurView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    position: "absolute",
    justifyContent: "space-around",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "white"
  },
  blur: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90
  },
  icon: {
    alignItems: "center",
    justifyContent: "center"
  },
  plusIcon: {
    alignItems: "center",
    justifyContent: "center",
    top: "4%",
    width: 50,
    height: 50,
    padding: 4,
    borderRadius: 15,
    backgroundColor: "black"
  }
})

export default EventTabBar
