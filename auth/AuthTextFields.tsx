import React, { forwardRef } from "react"
import {
  ShadedPasswordTextField,
  ShadedTextField,
  PasswordTextFieldProps,
  TextFieldProps,
  TextFieldRef
} from "@components/TextFields"
import {
  CircularIonicon,
  IoniconName,
  TouchableIonicon
} from "@components/common/Icons"
import { StyleProp, View, ViewStyle, StyleSheet } from "react-native"
import { useFontScale } from "@hooks/Fonts"
import { AppStyles } from "@lib/AppColorStyle"
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
  onActiveTextTypeChanged: (textType: EmailPhoneTextType) => void
} & Omit<AuthShadedTextFieldProps, "rightAddon" | "keyboardType" | "iconName">

/**
 * An auth text field that accepts both email addresses and phone numbers as input.
 */
export const AuthShadedEmailPhoneTextFieldView = forwardRef(function TextField (
  {
    activeTextType,
    onActiveTextTypeChanged,
    ...props
  }: AuthEmailPhoneTextFieldProps,
  ref: TextFieldRef
) {
  return (
    <AuthShadedTextField
      {...props}
      ref={ref}
      iconName={activeTextType === "email" ? "mail" : "phone-portrait"}
      keyboardType={activeTextType === "phone" ? "number-pad" : "email-address"}
      rightAddon={
        <View style={styles.toggleButtonsContainer}>
          <TouchableIonicon
            icon={{
              name: "phone-portrait",
              color:
                activeTextType === "phone"
                  ? AppStyles.darkColor
                  : AppStyles.colorOpacity35
            }}
            onPress={() => onActiveTextTypeChanged("phone")}
            style={styles.toggleButtonSpacing}
          />

          <TouchableIonicon
            icon={{
              name: "mail",
              color:
                activeTextType === "email"
                  ? AppStyles.darkColor
                  : AppStyles.colorOpacity35
            }}
            onPress={() => onActiveTextTypeChanged("email")}
          />
        </View>
      }
    />
  )
})

const styles = StyleSheet.create({
  toggleContainer: {
    position: "relative"
  },
  toggleButtonsContainer: {
    display: "flex",
    flexDirection: "row"
  },
  toggleButtonSpacing: {
    marginRight: 8
  },
  toggleSelectionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: AppStyles.darkColor
  },
  toggleSelectionContainer: {
    position: "absolute",
    left: 0
  }
})
