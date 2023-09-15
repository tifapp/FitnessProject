import { AuthSectionView } from "@auth/AuthSection"
import {
  AuthShadedPasswordTextField,
  AuthShadedTextField
} from "@auth/AuthTextFields"
import { Caption } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import React from "react"
import { StyleProp, ViewStyle, StyleSheet } from "react-native"

export type SignUpCredentialsFormFocusField =
  | "name"
  | "email-phone"
  | "password"

export type SignUpCredentialsFormProps = {
  onTermsAndConditionsTapped: () => void
  onPrivacyPolicyTapped: () => void
  focusField?: SignUpCredentialsFormFocusField
  onFocusFieldChanged: (focus?: SignUpCredentialsFormFocusField) => void
  style?: StyleProp<ViewStyle>
}

/**
 * The form the user uses to enter their initial information to create an account.
 */
export const SignUpCredentialsFormView = ({
  onPrivacyPolicyTapped,
  onTermsAndConditionsTapped,
  focusField,
  onFocusFieldChanged,
  style
}: SignUpCredentialsFormProps) => (
  <AuthSectionView
    title="Create your Account"
    description="Welcome to tiF! Begin your fitness journey by creating an account."
    callToActionTitle="I'm ready!"
    style={style}
  >
    <AuthShadedTextField
      iconName="person"
      iconBackgroundColor={AppStyles.linkColor}
      isFocused={focusField === "name"}
      returnKeyType="next"
      autoFocus
      onBlur={() => {
        if (focusField === "name") {
          onFocusFieldChanged(undefined)
        }
      }}
      onFocus={() => onFocusFieldChanged("name")}
      onSubmitEditing={() => onFocusFieldChanged("email-phone")}
      placeholder="Name"
    />
    <AuthShadedTextField
      iconName="phone-portrait"
      iconBackgroundColor="#14B329"
      placeholder="Phone number or Email"
      keyboardType="phone-pad"
      autoCapitalize="none"
      autoCorrect={false}
      isFocused={focusField === "email-phone"}
      returnKeyType="next"
      onBlur={() => {
        if (focusField === "email-phone") {
          onFocusFieldChanged(undefined)
        }
      }}
      onFocus={() => onFocusFieldChanged("email-phone")}
      onSubmitEditing={() => onFocusFieldChanged("password")}
      style={styles.textField}
    />
    <AuthShadedPasswordTextField
      iconName="lock-closed"
      iconBackgroundColor="#FB3640"
      placeholder="Password"
      isFocused={focusField === "password"}
      onBlur={() => {
        if (focusField === "password") {
          onFocusFieldChanged(undefined)
        }
      }}
      onFocus={() => onFocusFieldChanged("password")}
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
