import React from "react"
import { StyleSheet, Text, View } from "react-native"

export default function NearbyActivities () {
  return (
    <View style={styles.container}>
      <View style={styles.activitiesContainer}>
        <Text style={styles.activitiesText}>Nearby Activities</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderColor: "red",
    paddingBottom: "3%"
    // borderWidth: 2
  },
  activitiesContainer: {
    flex: 1,
    paddingLeft: "3%"
    // justifyContent: "space-around"
  },
  activitiesText: {
    fontSize: 20,
    textAlignVertical: "top",
    fontWeight: "bold"
  }
})
