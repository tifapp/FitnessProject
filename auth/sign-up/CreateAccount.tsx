import { AuthSectionView } from "@auth/AuthSection"
import {
  AuthFilledPasswordTextField,
  AuthFilledTextField
} from "@auth/AuthTextFields"
import { Caption } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import React from "react"
import { StyleProp, ViewStyle, StyleSheet } from "react-native"

export type CreateAccountFormProps = {
  style?: StyleProp<ViewStyle>
}

/**
 * The form the user uses to enter their initial information to create an account.
 */
export const CreateAccountFormView = ({ style }: CreateAccountFormProps) => (
  <AuthSectionView
    title="Create your Account"
    description="Welcome to tiF! Begin your fitness journey by creating an account."
    callToActionTitle="I'm ready!"
    footer={
      <Caption style={styles.disclaimerText}>
        <Caption>By creating an account, you agree to the </Caption>
        <Caption style={styles.legalLinkText}>terms and conditions</Caption>
        <Caption> and </Caption>
        <Caption style={styles.legalLinkText}>privacy policy</Caption>.
      </Caption>
    }
    style={style}
  >
    <AuthFilledTextField
      iconName="person"
      iconBackgroundColor={AppStyles.linkColor}
      placeholder="Name"
    />
    <AuthFilledTextField
      iconName="phone-portrait"
      iconBackgroundColor="#14B329"
      placeholder="Phone number or Email"
      keyboardType="phone-pad"
      autoCapitalize="none"
      autoCorrect={false}
      style={styles.textField}
    />
    <AuthFilledPasswordTextField
      iconName="lock-closed"
      iconBackgroundColor="#FB3640"
      placeholder="Password"
      style={styles.textField}
    />
  </AuthSectionView>
)

const styles = StyleSheet.create({
  textField: {
    marginTop: 16
  },
  disclaimerText: {
    textAlign: "center",
    opacity: 1
  },
  disclaimerTextBlock: {
    opacity: 0.5
  },
  legalLinkText: {
    color: AppStyles.linkColor,
    opacity: 1
  }
})
