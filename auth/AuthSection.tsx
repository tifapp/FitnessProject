import { BodyText, Title } from "@components/Text"
import { PrimaryButton } from "@components/common/Buttons"
import { useKeyboardState } from "@hooks/Keyboard"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import { useHeaderHeight } from "@react-navigation/elements"
import React, { ReactNode, useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import Animated from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export type AuthSectionProps = {
  title: string
  description: string
  children: ReactNode
  footer?: JSX.Element
  iOSInModal?: boolean
  callToActionTitle: string
  isCallToActionDisabled?: boolean
  onCallToActionTapped?: () => void
  style?: StyleProp<ViewStyle>
}

const IOS_MODAL_BOTTOM_OFFSET = 64

/**
 * A view that serves as a basis for making an auth screen.
 *
 * It automatically includes a title, description, a call to action at the bottom with an optional
 * footer above it, and handles weird scrolling behaviors.
 */
export const AuthSectionView = ({
  title,
  description,
  children,
  footer,
  callToActionTitle,
  isCallToActionDisabled,
  onCallToActionTapped,
  iOSInModal,
  style
}: AuthSectionProps) => {
  const [footerHeight, setFooterHeight] = useState(0)
  const insets = useSafeAreaInsets()
  const modalPaddingOffset =
    Platform.OS === "ios" && iOSInModal ? IOS_MODAL_BOTTOM_OFFSET : 0
  return (
    <View style={[style, styles.container]}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="interactive"
        contentContainerStyle={styles.fieldsContainer}
      >
        <Title>{title}</Title>
        <BodyText style={styles.descriptionText}>{description}</BodyText>
        {children}
        <View style={{ height: footerHeight }} />
      </KeyboardAwareScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.footer]}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        keyboardVerticalOffset={useHeaderHeight() + modalPaddingOffset}
      >
        <View
          style={[
            styles.footerContainer,
            {
              paddingBottom: !useKeyboardState().isPresented
                ? insets.bottom + 16
                : 16
            }
          ]}
          onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
        >
          {footer}
          <Animated.View layout={TiFDefaultLayoutTransition}>
            <PrimaryButton
              title={callToActionTitle}
              style={[
                styles.callToActionButton,
                { opacity: isCallToActionDisabled ? 0.5 : 1 }
              ]}
              disabled={isCallToActionDisabled}
              onPress={onCallToActionTapped}
              accessibilityLabel={callToActionTitle}
            />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

/**
 * A base type that all Auth Forms should union with.
 */
export type BaseAuthFormSubmission =
  | { status: "submittable"; submit: () => void }
  | { status: "submitting" }

export type AuthFormProps<Submission extends { status: "invalid" }> = {
  submissionTitle: string
  submission: Submission | BaseAuthFormSubmission
} & Omit<
  AuthSectionProps,
  "callToActionTitle" | "isCallToActionDisabled" | "onCallToActionTapped"
>

/**
 * A base view for creating an auth screen that acts as a form.
 *
 * It automatically includes a title, description, a call to action at the bottom with an optional
 * footer above it, and handles weird scrolling behaviors.
 */
export const AuthFormView = <Submission extends { status: "invalid" }>({
  submission,
  submissionTitle,
  ...props
}: AuthFormProps<Submission>) => (
    <AuthSectionView
      callToActionTitle={submissionTitle}
      isCallToActionDisabled={submission.status !== "submittable"}
      onCallToActionTapped={() => {
        if (submission.status === "submittable") {
          submission.submit()
        }
      }}
      {...props}
    />
  )

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
  descriptionText: {
    opacity: 0.5,
    marginBottom: 24
  },
  scrollView: {
    flex: 1
  },
  footerContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: "100%"
  },
  fieldsContainer: {
    padding: 16
  },
  callToActionButton: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 8
  }
})
