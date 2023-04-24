import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"

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
        <TouchableOpacity style={styles.plusIcon}>
          <Ionicons name="add-outline" color="white" size={30} />
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
  },
  plusIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    top: "4%",
    left: "4%",
    borderRadius: 15,
    backgroundColor: "black"
  }
})

export default EventTabBar
