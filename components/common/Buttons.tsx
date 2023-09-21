import { Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import React from "react"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle
} from "react-native"

type ButtonProps = {
  title: string
  style?: StyleProp<ViewStyle>
} & TouchableOpacityProps

export const PrimaryButton = ({ title, style, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        { backgroundColor: AppStyles.darkColor },
        styles.container,
        style
      ]}
      activeOpacity={0.8}
      {...props}
    >
      <Headline style={{ color: "white" }}>{title}</Headline>
      {props.children}
    </TouchableOpacity>
  )
}

export const OutlinedButton = ({ title, style, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles.lightStyle,
        { borderColor: AppStyles.colorOpacity15 },
        style
      ]}
      {...props}
    >
      <Headline style={{ color: AppStyles.darkColor }}>{title}</Headline>
      {props.children}
    </TouchableOpacity>
  )
}

export const DisabledButton = ({ title, style, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, styles.disabledStyle, style]}
      {...props}
      disabled
    >
      <Headline style={{ color: AppStyles.colorOpacity50 }}>{title}</Headline>
      {props.children}
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
  },
  disabledStyle: {
    flex: 1,
    backgroundColor: AppStyles.darkColor + "0D",
    borderWidth: 0
  }
})
