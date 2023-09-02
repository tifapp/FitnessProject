import { AuthSectionView } from "@auth/AuthSection"
import { AuthFilledTextField } from "@auth/AuthTextFields"
import { BodyText } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import React from "react"
import { StyleProp, ViewStyle, StyleSheet } from "react-native"

export type VerifyCodeProps = {
  style?: StyleProp<ViewStyle>
}

/**
 * A view for the user to verify their account with a 2FA code during sign up.
 */
export const CreateAccountVerifyCodeView = ({ style }: VerifyCodeProps) => (
  <AuthSectionView
    title="Verify your Account"
    description="We have sent a verification code to *****-61. Please enter it in the field below."
    footer={
      <BodyText style={styles.resendTextContainer}>
        <BodyText style={styles.resendText}>
          Didn&apos;t receive a code?{" "}
        </BodyText>
        <BodyText style={styles.resendLinkText}>Resend it.</BodyText>
      </BodyText>
    }
    callToActionTitle="Verify me!"
    style={style}
  >
    <AuthFilledTextField
      iconName="barcode-outline"
      iconBackgroundColor="#FB5607"
      placeholder="Enter the code sent to *****-61"
      textContentType="oneTimeCode"
      keyboardType="number-pad"
    />
  </AuthSectionView>
)

const styles = StyleSheet.create({
  resendTextContainer: {
    textAlign: "center",
    opacity: 1
  },
  resendText: {
    opacity: 0.5
  },
  resendLinkText: {
    color: AppStyles.linkColor,
    opacity: 1
  }
})