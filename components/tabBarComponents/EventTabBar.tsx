import React from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "@react-native-community/blur"

export const EventTabBar = () => {
  const darkIconColor = "#1c1c1c"

  return (
    <BlurView blurType="light">
      <TouchableOpacity style={styles.icon}>
        <Ionicons name="location" size={24} color={darkIconColor} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.icon}>
        <Ionicons name="chatbox" size={24} color={"grey"} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.icon}>
        <Ionicons name="add-circle" size={60} color={darkIconColor} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.icon}>
        <Ionicons name="notifications" size={24} color={"grey"} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.icon}>
        <Ionicons name="person" size={24} color={"grey"} />
      </TouchableOpacity>
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
  icon: {
    alignItems: "center",
    justifyContent: "center"
  }
})

export default EventTabBar
