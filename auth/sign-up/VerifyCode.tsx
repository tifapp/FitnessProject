import { Title, BodyText } from "@components/Text"
import { FilledTextField } from "@components/TextFields"
import { PrimaryButton } from "@components/common/Buttons"
import { CircularIonicon } from "@components/common/Icons"
import { useFontScale } from "@hooks/Fonts"
import { useKeyboardState } from "@hooks/Keyboard"
import { AppStyles } from "@lib/AppColorStyle"
import { useHeaderHeight } from "@react-navigation/stack"
import React, { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  View,
  ViewStyle,
  StyleSheet
} from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export type VerifyCodeProps = {
  style?: StyleProp<ViewStyle>
}

export const VerifyCodeView = ({ style }: VerifyCodeProps) => {
  const [footerHeight, setFooterHeight] = useState(0)
  const textFieldHeight = 32 * useFontScale()
  const { isPresented: isKeyboardPresented } = useKeyboardState()
  const insets = useSafeAreaInsets()
  return (
    <View style={[style, styles.container]}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="always"
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="interactive"
        contentContainerStyle={styles.fieldsContainer}
      >
        <Title>Verify your Account</Title>
        <BodyText style={styles.bodyText}>
          We have sent a verification code to *****-61. Please enter it in the
          field below.
        </BodyText>

        <FilledTextField
          leftAddon={
            <CircularIonicon
              backgroundColor="#FB5607"
              name="barcode-outline"
              color={AppStyles.colorOpacity50}
            />
          }
          placeholder="Enter the code sent to *****-61"
          textContentType="oneTimeCode"
          keyboardType="number-pad"
          textStyle={{ height: textFieldHeight }}
        />
        <View style={{ height: footerHeight }} />
      </KeyboardAwareScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.footer]}
        contentContainerStyle={{ paddingBottom: useSafeAreaInsets().bottom }}
        keyboardVerticalOffset={useHeaderHeight()}
      >
        <View
          style={[
            styles.footerContainer,
            { paddingBottom: !isKeyboardPresented ? insets.bottom + 16 : 16 }
          ]}
          onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
        >
          <BodyText style={styles.resendTextContainer}>
            <BodyText style={styles.resendText}>
              Didn&apos;t receive a code?{" "}
            </BodyText>
            <BodyText style={styles.resendLinkText}>Resend it.</BodyText>
          </BodyText>
          <PrimaryButton title="Verify me!" style={styles.nextButton} />
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1
  },
  footer: {
    position: "absolute",
    width: "100%",
    flex: 1,
    backgroundColor: "white",
    bottom: 0
  },
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
  },
  bodyText: {
    opacity: 0.5,
    marginBottom: 24
  },
  scrollView: {
    flex: 1
  },
  footerContainer: {
    flex: 1,
    padding: 16,
    width: "100%"
  },
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
  nextButton: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 8
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
  signUpWithGoogleText: {
    marginLeft: 16
  }
})
