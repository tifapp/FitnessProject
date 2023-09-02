import React from "react"
import {
  FilledPasswordTextField,
  FilledTextField,
  PasswordTextFieldProps,
  TextFieldProps
} from "@components/TextFields"
import { CircularIonicon, IoniconName } from "@components/common/Icons"
import { StyleProp, ViewStyle } from "react-native"
import { useFontScale } from "@hooks/Fonts"

export type AuthFilledTextFieldProps = {
  iconName: IoniconName
  iconBackgroundColor: string
  style?: StyleProp<ViewStyle>
} & Omit<TextFieldProps, "leftAddon">

/**
 * A filled text field matching the style of the auth screens.
 */
export const AuthFilledTextField = ({
  iconName,
  iconBackgroundColor,
  style,
  ...props
}: AuthFilledTextFieldProps) => {
  const textFieldHeight = 32 * useFontScale()
  return (
    <FilledTextField
      leftAddon={
        <CircularIonicon
          backgroundColor={iconBackgroundColor}
          name={iconName}
        />
      }
      {...props}
      style={style}
      textStyle={{ height: textFieldHeight }}
    />
  )
}

export type AuthFilledPasswordTextFieldProps = {
  iconName: IoniconName
  iconBackgroundColor: string
  style?: StyleProp<ViewStyle>
} & Omit<PasswordTextFieldProps, "leftAddon">

/**
 * A filled password text field matching the style of the auth screens.
 */
export const AuthFilledPasswordTextField = ({
  iconName,
  iconBackgroundColor,
  style,
  ...props
}: AuthFilledPasswordTextFieldProps) => {
  const textFieldHeight = 32 * useFontScale()
  return (
    <FilledPasswordTextField
      leftAddon={
        <CircularIonicon
          backgroundColor={iconBackgroundColor}
          name={iconName}
        />
      }
      {...props}
      style={style}
      textStyle={{ height: textFieldHeight }}
    />
  )
}
