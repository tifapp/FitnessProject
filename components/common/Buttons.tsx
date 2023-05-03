import { Headline } from "@components/Text"
import { ButtonStyles } from "@lib/AppColorStyle"
import React from "react"
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps
} from "react-native"

interface ButtonProps {
  title: string
  buttonProps: TouchableOpacityProps
}

export const PrimaryButton = ({ title, buttonProps }: ButtonProps) => {
  return (
    <TouchableOpacity
      {...buttonProps}
      style={[
        buttonProps.style,
        styles.container,
        { backgroundColor: ButtonStyles.darkColor }
      ]}
    >
      <Headline style={{ color: "white" }}>{title}</Headline>
      {buttonProps.children}
    </TouchableOpacity>
  )
}

export const OutlinedButton = ({ title, buttonProps }: ButtonProps) => {
  return (
    <TouchableOpacity
      {...buttonProps}
      style={[
        buttonProps.style,
        styles.container,
        styles.lightStyle,
        { borderColor: ButtonStyles.colorOpacity15 }
      ]}
    >
      <Headline style={{ color: ButtonStyles.darkColor }}>{title}</Headline>
      {buttonProps.children}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
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
