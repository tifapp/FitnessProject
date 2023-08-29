import { Title, BodyText } from "@components/Text"
import { FilledTextField } from "@components/TextFields"
import { PrimaryButton } from "@components/common/Buttons"
import { CircularIonicon, Ionicon } from "@components/common/Icons"
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

export type InvalidUserHandleReason = "already-taken" | "bad-format"

const errorTextForInvalidHandleReason = (
  invalidHandleReason: InvalidUserHandleReason
) => {
  if (invalidHandleReason === "already-taken") {
    return "This username is already taken."
  }
  return "Your username can only contain letters, numbers, and underscores."
}

export type CreateAccountUserHandleFormProps = {
  currentHandleText: string
  onCurrentHandleTextChanged: (handleText: string) => void
  invalidHandleReason?: InvalidUserHandleReason
  style?: StyleProp<ViewStyle>
}

export const CreateAccountUserHandleFormView = ({
  currentHandleText,
  onCurrentHandleTextChanged,
  invalidHandleReason,
  style
}: CreateAccountUserHandleFormProps) => {
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
        <Title>Pick your Username</Title>
        <BodyText style={styles.bodyText}>
          We have created a username for you, but you can customize it if you
          don&apos;t like it. It&apos;s also possible to change it later if you
          want to.
        </BodyText>

        <FilledTextField
          leftAddon={
            <CircularIonicon
              backgroundColor={AppStyles.darkColor}
              name="at-outline"
              color={AppStyles.colorOpacity50}
            />
          }
          rightAddon={
            <Ionicon
              color={!invalidHandleReason ? "#14B329" : "#FB3640"}
              name={!invalidHandleReason ? "checkmark" : "close"}
            />
          }
          error={
            invalidHandleReason
              ? errorTextForInvalidHandleReason(invalidHandleReason)
              : undefined
          }
          placeholder="Enter a username"
          keyboardType="twitter"
          value={currentHandleText}
          onChangeText={onCurrentHandleTextChanged}
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
          <PrimaryButton title="I like this name!" style={styles.nextButton} />
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
