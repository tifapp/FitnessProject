import React, { ReactNode, useState } from "react"
import {
  TextInputProps,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle
} from "react-native"
import { TextInput } from "react-native-gesture-handler"
import { Caption } from "./Text"
import { AppStyles } from "@lib/AppColorStyle"
import { TouchableIonicon } from "./common/Icons"

export type TextFieldProps = {
  leftAddon?: JSX.Element
  rightAddon?: JSX.Element
  error?: ReactNode
  style?: StyleProp<ViewStyle>
} & Omit<TextInputProps, "style" | "placeholderStyle">

/**
 * A generic Text Field component.
 */
export const TextField = ({
  leftAddon,
  rightAddon,
  error,
  style,
  ...props
}: TextFieldProps) => {
  const borderColor = error ? AppStyles.errorColor : "rgba(0, 0, 0, 0.10)"
  return (
    <View style={style}>
      <View style={[styles.card, { borderColor }]}>
        <View style={styles.container}>
          <View style={styles.leftAddon}>{leftAddon}</View>
          <View style={styles.leftContainer}>
            <TextInput
              style={styles.textInput}
              placeholderTextColor={AppStyles.colorOpacity35}
              {...props}
            />
          </View>
          <View style={styles.rightAddon}>{rightAddon}</View>
        </View>
      </View>
      {typeof error === "string" || typeof error === "number"
        ? (
          <Caption style={styles.errorText}>{error}</Caption>
        )
        : (
          error
        )}
    </View>
  )
}

export type PasswordTextFieldProps = Omit<
  TextFieldProps,
  "rightAddon" | "secureTextEntry"
>

/**
 * A text field component for password inputs.
 */
export const PasswordTextField = ({ ...props }: PasswordTextFieldProps) => {
  const [isShowingPassword, setIsShowingPassword] = useState(false)
  return (
    <TextField
      secureTextEntry={!isShowingPassword}
      rightAddon={
        <TouchableIonicon
          icon={{ name: isShowingPassword ? "eye" : "lock-closed" }}
          onPress={() => {
            setIsShowingPassword((isShowing) => !isShowing)
          }}
          accessibilityLabel={
            isShowingPassword ? "Hide password" : "Show password"
          }
        />
      }
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 12,
    width: "100%"
  },
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 8
  },
  leftContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    flex: 1
  },
  leftAddon: {
    marginRight: 8
  },
  textInput: {
    fontSize: 16,
    fontFamily: "OpenSans",
    width: "100%"
  },
  rightAddon: {
    marginLeft: 8
  },
  errorText: {
    color: AppStyles.errorColor,
    opacity: 1,
    padding: 4
  },
  placeholderText: {
    color: AppStyles.darkColor,
    opacity: 0.5
  }
})
