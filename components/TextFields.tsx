import React, { ReactNode, useEffect, useRef, useState } from "react"
import {
  TextInputProps,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle
} from "react-native"
import { TextInput } from "react-native-gesture-handler"
import { Caption } from "./Text"
import { AppStyles } from "@lib/AppColorStyle"
import { TouchableIonicon } from "./common/Icons"

export type TextFieldProps = {
  leftAddon?: JSX.Element
  rightAddon?: JSX.Element
  error?: ReactNode
  isFocused?: boolean
  textStyle?: StyleProp<TextStyle>
  style?: StyleProp<ViewStyle>
} & Omit<TextInputProps, "style" | "placeholderStyle">

/**
 * A generic Text Field component.
 */
export const TextField = ({ error, style, ...props }: TextFieldProps) => {
  const borderColor = error ? AppStyles.errorColor : "rgba(0, 0, 0, 0.10)"
  return (
    <View style={style}>
      <View style={[styles.card, { borderColor }]}>
        <InternalTextField
          placeholderTextColor={AppStyles.colorOpacity35}
          {...props}
        />
      </View>
      <TextFieldErrorView error={error} />
    </View>
  )
}

/**
 * A text field with a filled background.
 */
export const ShadedTextField = ({ error, style, ...props }: TextFieldProps) => (
  <View style={style}>
    <View style={[styles.filledCard]}>
      <InternalTextField
        placeholderTextColor={AppStyles.colorOpacity35}
        {...props}
      />
    </View>
    <TextFieldErrorView error={error} />
  </View>
)

const TextFieldErrorView = ({ error }: { error?: ReactNode }) => (
  <>
    {typeof error === "string" || typeof error === "number"
      ? (
        <Caption style={styles.errorText}>{error}</Caption>
      )
      : (
        error
      )}
  </>
)

const InternalTextField = ({
  leftAddon,
  rightAddon,
  textStyle,
  isFocused,
  ...props
}: TextFieldProps) => {
  const ref = useRef<TextInput>(null)

  useEffect(() => {
    if (isFocused) {
      ref.current?.focus()
    } else {
      ref.current?.blur()
    }
  }, [isFocused])

  return (
    <View style={styles.container}>
      <View style={styles.leftAddon}>{leftAddon}</View>
      <View style={styles.leftContainer}>
        <TextInput
          ref={ref}
          style={[styles.textInput, textStyle]}
          placeholderTextColor={AppStyles.colorOpacity50}
          {...props}
        />
      </View>
      <View style={styles.rightAddon}>{rightAddon}</View>
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
export const PasswordTextField = ({ ...props }: PasswordTextFieldProps) => (
  <InternalPasswordTextField TextFieldView={TextField} {...props} />
)

/**
 * A password text field which is filled with a solic background
 */
export const ShadedPasswordTextField = ({
  ...props
}: PasswordTextFieldProps) => (
  <InternalPasswordTextField
    TextFieldView={ShadedTextField}
    iconColor={AppStyles.colorOpacity50}
    {...props}
  />
)

type InternalPasswordTextFieldProps = {
  TextFieldView: typeof TextField
  iconColor?: string
} & PasswordTextFieldProps

const InternalPasswordTextField = ({
  TextFieldView,
  iconColor,
  ...props
}: InternalPasswordTextFieldProps) => {
  const [isShowingPassword, setIsShowingPassword] = useState(false)
  return (
    <TextFieldView
      secureTextEntry={!isShowingPassword}
      rightAddon={
        <TouchableIonicon
          icon={{
            name: isShowingPassword ? "eye" : "eye-off",
            color: iconColor
          }}
          onPress={() => {
            setIsShowingPassword((isShowing) => !isShowing)
          }}
          accessibilityLabel={
            isShowingPassword ? "Hide password" : "Show password"
          }
        />
      }
      autoCorrect={false}
      autoCapitalize="none"
      autoComplete="password"
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  filledCard: {
    backgroundColor: AppStyles.eventCardColor,
    borderRadius: 12,
    width: "100%"
  },
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
