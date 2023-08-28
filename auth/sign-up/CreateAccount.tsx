import { Caption } from "@components/Text"
import {
  FilledPasswordTextField,
  FilledTextField
} from "@components/TextFields"
import { PrimaryButton } from "@components/common/Buttons"
import { useFontScale } from "@hooks/Fonts"
import { AppStyles } from "@lib/AppColorStyle"
import React from "react"
import { StyleProp, View, ViewStyle, StyleSheet } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

export type CreateAccountProps = {
  style?: StyleProp<ViewStyle>
}

export const CreateAccountView = ({ style }: CreateAccountProps) => {
  const textFieldHeight = 48 * useFontScale()
  return (
    <KeyboardAwareScrollView style={style}>
      <View style={styles.illustration} />

      <View style={styles.fieldsContainer}>
        <FilledTextField
          placeholder="Name"
          textStyle={{ height: textFieldHeight }}
        />
        <FilledTextField
          placeholder="Phone number or Email"
          textStyle={{ height: textFieldHeight }}
          style={styles.textField}
        />
        <FilledPasswordTextField
          placeholder="Password"
          textStyle={{ height: textFieldHeight }}
          style={styles.textField}
        />

        <PrimaryButton
          title="Create Account"
          style={styles.createAccountButton}
        />
        <Caption style={styles.disclaimerText}>
          By signing up, you agree to the{" "}
          <Caption style={styles.termsAndConditions}>
            terms and conditions.
          </Caption>
        </Caption>
      </View>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  textFieldHeight: {
    height: 48
  },
  fieldsContainer: {
    padding: 16
  },
  illustration: {
    backgroundColor: "red",
    height: 200,
    width: "100%"
  },
  textField: {
    marginTop: 16
  },
  createAccountButton: {
    width: "100%",
    marginTop: 32,
    paddingHorizontal: 16
  },
  disclaimerText: {
    textAlign: "center",
    marginTop: 8
  },
  termsAndConditions: {
    color: AppStyles.linkColor,
    opacity: 1,
    textAlign: "center"
  },
  dividerContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 32
  },
  dividerText: {
    marginHorizontal: 8
  },
  divider: {
    flex: 1
  },
  signInWithAppleButton: {
    backgroundColor: "red",
    borderRadius: 12,
    height: 48,
    width: "100%"
  },
  signInWithGoogleButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppStyles.eventCardBorder,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 48,
    marginTop: 16
  },
  signUpWithGoogleText: {
    marginLeft: 16
  }
})
