import { Caption, Headline } from "@components/Text"
import { PasswordTextField, TextField } from "@components/TextFields"
import { PrimaryButton } from "@components/common/Buttons"
import { Ionicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import React from "react"
import { StyleProp, View, ViewStyle, StyleSheet } from "react-native"
import { Divider } from "react-native-elements"
import { TouchableOpacity } from "react-native-gesture-handler"

export type CreateAccountProps = {
  style?: StyleProp<ViewStyle>
}

export const CreateAccountView = ({ style }: CreateAccountProps) => {
  return (
    <View style={style}>
      <View style={styles.illustration} />

      <View style={styles.fieldsContainer}>
        <TextField placeholder="Name" />
        <TextField
          placeholder="Phone number or Email"
          style={styles.textField}
        />
        <PasswordTextField placeholder="Password" style={styles.textField} />

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

        <View style={styles.dividerContainer}>
          <Divider style={styles.divider} />
          <Caption style={styles.dividerText}>Or</Caption>
          <Divider style={styles.divider} />
        </View>
        <View style={styles.signInWithAppleButton} />
        <SignInWithGoogleButton />
      </View>
    </View>
  )
}

const SignInWithGoogleButton = () => (
  <TouchableOpacity style={styles.signInWithGoogleButton}>
    <Ionicon name="logo-google" />
    <Headline style={styles.signUpWithGoogleText}>Sign up with Google</Headline>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
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
