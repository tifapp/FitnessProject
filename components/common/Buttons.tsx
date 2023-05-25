import { Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import React from "react"
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle
} from "react-native"

type ButtonProps = {
  title: string
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
} & TouchableOpacityProps

export const PrimaryButton = ({title, style, textStyle, ...props}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: AppStyles.darkColor },
        style
      ]}
      {...props}
    >
      <Headline style={[{ color: "white" }, textStyle]}>{title}</Headline>
      {props.children}
    </TouchableOpacity>
  )
}

export const OutlinedButton = ({title, style, textStyle, ...props}: ButtonProps) => {
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
      <Headline style={[{ color: AppStyles.darkColor }, textStyle]}>{title}</Headline>
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
  }
})
