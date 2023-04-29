import React from "react"
import { StyleSheet, Text, TouchableOpacity } from "react-native"
export interface MyButtonProps {
  onPress: () => void
  text: string
}

export const MyButton = ({ onPress, text }: MyButtonProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "violet"
  },
  text: { color: "black" }
})
