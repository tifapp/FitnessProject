import React from "react"
import {StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native"

const hexAlpha = "26" // 15% Opacity

export namespace CustomButtonStyles {
  export const darkColor = "#26282A"
}

export const CustomButton = (props: TouchableOpacityProps) => {
  return (
    <TouchableOpacity
      {...props}
      style={[props.style, styles.container, {backgroundColor: CustomButtonStyles.darkColor}]}>
      {props.children}
    </TouchableOpacity>
  )
}

export const CustomOutlinedButton = (props: TouchableOpacityProps) => {
  return (
    <TouchableOpacity
      {...props}
      style={[
        props.style,
        styles.container,
        styles.lightStyle,
        {borderColor: CustomButtonStyles.darkColor + hexAlpha}
      ]}>
      {props.children}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create ({
  container: {
    height: 48,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12
  },
  lightStyle: {
    backgroundColor: "white",
    borderWidth: 1
  }
})