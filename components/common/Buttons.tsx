import React from "react"
import { ButtonProps, Pressable, StyleSheet } from "react-native"
import { Headline } from "@components/Text"

const darkColor = "#26282A"
const hexAlpha = "26" // 15% Opacity

export const DarkButton = (props: ButtonProps) => {
  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.container, {backgroundColor: darkColor}]}>
      <Headline style={styles.darkStyleText}>{props.title}</Headline>
    </Pressable>
  )
}

export const LightButton = (props: ButtonProps) => {
  return (
    <Pressable
      onPress={props.onPress}
      style={[
        styles.container,
        styles.lightStyle,
        {borderColor: darkColor + hexAlpha}
      ]}>
      <Headline style={styles.lightStyleText}>{props.title}</Headline>
    </Pressable>
  )
}

const styles = StyleSheet.create ({
  container: {
    height: 48,
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12
  },
  darkStyleText: {
    color: "white"
  },
  lightStyle: {
    backgroundColor: "white",
    borderWidth: 1
  },
  lightStyleText: {
    color: "black"
  }
})