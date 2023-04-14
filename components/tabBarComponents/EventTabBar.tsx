import React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"

export const EventTabBar = () => {
  const darkIconColor = "#1c1c1c"
  const iconSize = 24

  return (
    <BlurView intensity={100} tint="light" style={styles.blur}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.icon}>
          <Ionicons name="location" size={iconSize} color={darkIconColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon}>
          <Ionicons name="chatbox" size={iconSize} color={"grey"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon}>
          <Ionicons name="add-circle" size={60} color={darkIconColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon}>
          <Ionicons name="notifications" size={iconSize} color={"grey"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon}>
          <Ionicons name="person" size={iconSize} color={"grey"} />
        </TouchableOpacity>
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
  }
})

export default EventTabBar
