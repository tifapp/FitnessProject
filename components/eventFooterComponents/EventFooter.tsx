import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export const EventFooter = () => {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name="location" size={30} color={"#1c1c1c"} />
      </View>
      <View style={styles.icon}>
        <Ionicons name="notifications" size={30} color={"grey"} />
      </View>
      <View style={styles.icon}>
        <Ionicons name="add-circle" size={65} color={"#1c1c1c"} />
      </View>
      <View style={styles.icon}>
        <Ionicons name="chatbox" size={30} color={"grey"} />
      </View>
      <View style={styles.icon}>
        <Ionicons name="person" size={30} color={"grey"} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    position: "absolute",
    // justifyContent: "space-evenly",
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    backgroundColor: "white",
    borderWidth: 2
  },
  icon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
})

export default EventFooter
