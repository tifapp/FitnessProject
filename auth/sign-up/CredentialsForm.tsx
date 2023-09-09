import { AuthSectionView } from "@auth/AuthSection"
import {
  AuthShadedPasswordTextField,
  AuthShadedTextField
} from "@auth/AuthTextFields"
import { Caption } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import React from "react"
import { StyleProp, ViewStyle, StyleSheet } from "react-native"

export type CreateAccountCredentialsFormProps = {
  onTermsAndConditionsTapped: () => void
  onPrivacyPolicyTapped: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * The form the user uses to enter their initial information to create an account.
 */
export const CreateAccountCredentialsFormView = ({
  onPrivacyPolicyTapped,
  onTermsAndConditionsTapped,
  style
}: CreateAccountCredentialsFormProps) => (
  <AuthSectionView
    title="Create your Account"
    description="Welcome to tiF! Begin your fitness journey by creating an account."
    callToActionTitle="I'm ready!"
    style={style}
  >
    <AuthShadedTextField
      iconName="person"
      iconBackgroundColor={AppStyles.linkColor}
      placeholder="Name"
    />
    <AuthShadedTextField
      iconName="phone-portrait"
      iconBackgroundColor="#14B329"
      placeholder="Phone number or Email"
      keyboardType="phone-pad"
      autoCapitalize="none"
      autoCorrect={false}
      style={styles.textField}
    />
    <AuthShadedPasswordTextField
      iconName="lock-closed"
      iconBackgroundColor="#FB3640"
      placeholder="Password"
      style={styles.textField}
    />
    <Caption style={styles.disclaimerText}>
      <Caption>By creating an account, you agree to the </Caption>
      <Caption
        onPress={onTermsAndConditionsTapped}
        style={styles.legalLinkText}
      >
        terms and conditions
      </Caption>
      <Caption> and </Caption>
      <Caption onPress={onPrivacyPolicyTapped} style={styles.legalLinkText}>
        privacy policy
      </Caption>
      .
    </Caption>
  </AuthSectionView>
)

const styles = StyleSheet.create({
  textField: {
    marginTop: 16
  },
  disclaimerText: {
    textAlign: "center",
    opacity: 1,
    marginTop: 16
  },
  disclaimerTextBlock: {
    opacity: 0.5
  },
  legalLinkText: {
    color: AppStyles.linkColor,
    opacity: 1
  }
})
