import React, { ReactNode, Ref, forwardRef, useState } from "react"
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
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated"

export type TextFieldRefValue = TextInput | null

export type TextFieldRef = Ref<TextInput> | undefined

export type TextFieldProps = {
  leftAddon?: JSX.Element
  rightAddon?: JSX.Element
  error?: ReactNode
  textStyle?: StyleProp<TextStyle>
  style?: StyleProp<ViewStyle>
} & Omit<TextInputProps, "style" | "placeholderStyle">

/**
 * A generic Text Field component.
 */
export const TextField = forwardRef(function TextField(
  { error, style, ...props }: TextFieldProps,
  ref: TextFieldRef
) {
  const borderColor = error ? AppStyles.errorColor : "rgba(0, 0, 0, 0.10)"
  return (
    <View style={style}>
      <View style={[styles.card, { borderColor }]}>
        <InternalTextField
          ref={ref}
          placeholderTextColor={AppStyles.colorOpacity35}
          {...props}
        />
      </View>
      {error && <TextFieldErrorView error={error} />}
    </View>
  )
})

/**
 * A text field with a filled background.
 */
export const ShadedTextField = forwardRef(function TextField(
  { error, style, ...props }: TextFieldProps,
  ref: TextFieldRef
) {
  return (
    <View style={style}>
      <View style={[styles.filledCard]}>
        <InternalTextField
          ref={ref}
          placeholderTextColor={AppStyles.colorOpacity35}
          {...props}
        />
      </View>
      {error && <TextFieldErrorView error={error} />}
    </View>
  )
})

const TextFieldErrorView = ({ error }: { error: ReactNode }) => (
  <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
    {typeof error === "string" || typeof error === "number" ? (
      <Caption style={styles.errorText}>{error}</Caption>
    ) : (
      error
    )}
  </Animated.View>
)

const InternalTextField = forwardRef(function TextField(
  { leftAddon, rightAddon, textStyle, ...props }: TextFieldProps,
  ref: TextFieldRef
) {
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
})

export type PasswordTextFieldProps = Omit<
  TextFieldProps,
  "rightAddon" | "secureTextEntry"
>

/**
 * A text field component for password inputs.
 */
export const PasswordTextField = forwardRef(function Field(
  { ...props }: PasswordTextFieldProps,
  ref: TextFieldRef
) {
  return (
    <InternalPasswordTextField TextFieldView={TextField} ref={ref} {...props} />
  )
})

/**
 * A password text field which is filled with a solic background
 */
export const ShadedPasswordTextField = forwardRef(function TextField(
  { ...props }: PasswordTextFieldProps,
  ref: TextFieldRef
) {
  return (
    <InternalPasswordTextField
      TextFieldView={ShadedTextField}
      iconColor={AppStyles.colorOpacity50}
      ref={ref}
      {...props}
    />
  )
})

type InternalPasswordTextFieldProps = {
  TextFieldView: typeof TextField
  iconColor?: string
} & PasswordTextFieldProps

const InternalPasswordTextField = forwardRef(function TextField(
  { TextFieldView, iconColor, ...props }: InternalPasswordTextFieldProps,
  ref: TextFieldRef
) {
  const [isShowingPassword, setIsShowingPassword] = useState(false)
  return (
    <TextFieldView
      ref={ref}
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
})

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
