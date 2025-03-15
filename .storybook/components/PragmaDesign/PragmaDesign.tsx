import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { useSharedValue } from "react-native-reanimated"

class X {
  x = 1
}

export const PragmaDesign = () => {
  const value = useSharedValue(new X())
  return (
    <View style={styles.container}>
      <Text style={styles.text}>PragmaDesign Component</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  text: {
    fontSize: 16,
    fontWeight: "500"
  }
})
