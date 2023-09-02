import React from "react"
import {
  ShadedPasswordTextField,
  ShadedTextField,
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
export const AuthShadedTextField = ({
  iconName,
  iconBackgroundColor,
  style,
  ...props
}: AuthFilledTextFieldProps) => {
  const textFieldHeight = 32 * useFontScale()
  return (
    <ShadedTextField
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
export const AuthShadedPasswordTextField = ({
  iconName,
  iconBackgroundColor,
  style,
  ...props
}: AuthFilledPasswordTextFieldProps) => {
  const textFieldHeight = 32 * useFontScale()
  return (
    <ShadedPasswordTextField
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
