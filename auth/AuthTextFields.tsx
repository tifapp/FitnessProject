import {
  PasswordTextFieldProps,
  ShadedPasswordTextField,
  ShadedTextField,
  TextFieldProps,
  TextFieldRef
} from "@components/TextFields"
import { CircularIonicon, Ionicon, IoniconName } from "@components/common/Icons"
import { useFontScale } from "@hooks/Fonts"
import { AppStyles } from "@lib/AppColorStyle"
import React, { forwardRef } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { EmailPhoneTextType } from "./UseEmailPhoneText"

export type AuthShadedTextFieldProps = {
  iconName: IoniconName
  iconBackgroundColor: string
  style?: StyleProp<ViewStyle>
} & Omit<TextFieldProps, "leftAddon">

/**
 * A filled text field matching the style of the auth screens.
 */
export const AuthShadedTextField = forwardRef(function TextField (
  { iconName, iconBackgroundColor, style, ...props }: AuthShadedTextFieldProps,
  ref: TextFieldRef
) {
  const textFieldHeight = 32 * useFontScale()
  return (
    <ShadedTextField
      ref={ref}
      leftAddon={
        <CircularIonicon
          backgroundColor={iconBackgroundColor}
          name={iconName}
          accessibilityElementsHidden
        />
      }
      {...props}
      style={style}
      textStyle={{ height: textFieldHeight }}
    />
  )
})

export type AuthShadedPasswordTextFieldProps = {
  iconName: IoniconName
  iconBackgroundColor: string
  style?: StyleProp<ViewStyle>
} & Omit<PasswordTextFieldProps, "leftAddon">

/**
 * A filled password text field matching the style of the auth screens.
 */
export const AuthShadedPasswordTextField = forwardRef(function TextField (
  {
    iconName,
    iconBackgroundColor,
    style,
    ...props
  }: AuthShadedPasswordTextFieldProps,
  ref: TextFieldRef
) {
  const textFieldHeight = 32 * useFontScale()
  return (
    <ShadedPasswordTextField
      ref={ref}
      leftAddon={
        <CircularIonicon
          backgroundColor={iconBackgroundColor}
          name={iconName}
          accessibilityElementsHidden
        />
      }
      {...props}
      style={style}
      textStyle={{ height: textFieldHeight }}
    />
  )
})

export type AuthEmailPhoneTextFieldProps = {
  activeTextType: EmailPhoneTextType
  onActiveTextTypeToggled: () => void
} & Omit<AuthShadedTextFieldProps, "rightAddon" | "keyboardType" | "iconName">

/**
 * An auth text field that accepts both email addresses and phone numbers as input.
 */
export const AuthShadedEmailPhoneTextFieldView = forwardRef(function TextField (
  {
    activeTextType,
    onActiveTextTypeToggled,
    ...props
  }: AuthEmailPhoneTextFieldProps,
  ref: TextFieldRef
) {
  return (
    <AuthShadedTextField
      {...props}
      ref={ref}
      iconName={activeTextType === "email" ? "mail" : "call"}
      keyboardType={activeTextType === "phone" ? "number-pad" : "email-address"}
      rightAddon={
        <TouchableOpacity
          style={styles.emailPhoneToggleButtonContainer}
          onPress={onActiveTextTypeToggled}
          hitSlop={32}
        >
          <Ionicon name="refresh" color={AppStyles.colorOpacity35} />
          <Ionicon
            name={activeTextType === "phone" ? "mail" : "call"}
            color={AppStyles.colorOpacity35}
          />
        </TouchableOpacity>
      }
    />
  )
})

const styles = StyleSheet.create({
  emailPhoneToggleButtonContainer: {
    display: "flex",
    flexDirection: "row"
  }
})
