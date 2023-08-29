import { BodyText, Caption, Title } from "@components/Text"
import {
  FilledPasswordTextField,
  FilledTextField
} from "@components/TextFields"
import { PrimaryButton } from "@components/common/Buttons"
import { CircularIonicon } from "@components/common/Icons"
import { useFontScale } from "@hooks/Fonts"
import { useKeyboardState } from "@hooks/Keyboard"
import { AppStyles } from "@lib/AppColorStyle"
import { useHeaderHeight } from "@react-navigation/stack"
import React, { useState } from "react"
import {
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export type CreateAccountFormProps = {
  style?: StyleProp<ViewStyle>
}

/**
 * The form the user uses to enter their initial information to create an account.
 */
export const CreateAccountFormView = ({ style }: CreateAccountFormProps) => {
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
        <Title>Let&apos;s Get Started!</Title>
        <BodyText style={styles.bodyText}>
          Welcome to tiF! Begin your fitness journey by signing up.
        </BodyText>

        <FilledTextField
          leftAddon={
            <CircularIonicon
              backgroundColor={AppStyles.linkColor}
              name="person"
              color={AppStyles.colorOpacity50}
            />
          }
          placeholder="Name"
          textStyle={{ height: textFieldHeight }}
        />
        <FilledTextField
          placeholder="Phone number or Email"
          leftAddon={
            <CircularIonicon
              backgroundColor="#14B329"
              name="phone-portrait"
              color={AppStyles.colorOpacity50}
            />
          }
          textStyle={{ height: textFieldHeight }}
          style={styles.textField}
        />
        <FilledPasswordTextField
          placeholder="Password"
          leftAddon={
            <CircularIonicon
              backgroundColor="#FB3640"
              name="lock-closed"
              color={AppStyles.colorOpacity50}
            />
          }
          textStyle={{ height: textFieldHeight }}
          style={styles.textField}
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
          <Caption style={styles.disclaimerText}>
            <Caption>By signing up, you agree to the </Caption>
            <Caption style={styles.legalLinkText}>terms and conditions</Caption>
            <Caption> and </Caption>
            <Caption style={styles.legalLinkText}>privacy policy</Caption>.
          </Caption>
          <PrimaryButton
            title="Create Account"
            style={styles.createAccountButton}
          />
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
  createAccountButton: {
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
