import { PrimaryButton } from "@components/Buttons"
import { TiFFooterView } from "@components/Footer"
import { BodyText, Title } from "@components/Text"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import React, { ReactNode, useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions
} from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import Animated from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export type AuthSectionProps = {
  title: string
  description: string
  children: ReactNode
  footer?: JSX.Element
  callToActionTitle: string
  isCallToActionDisabled?: boolean
  onCallToActionTapped?: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * A view that serves as a basis for making an auth screen.
 *
 * It automatically includes a title, description, a call to action at the bottom with an optional
 * footer above it, and handles weird scrolling behaviors.
 */
export const AuthLayoutView = ({
  title,
  description,
  children,
  footer,
  callToActionTitle,
  isCallToActionDisabled,
  onCallToActionTapped,
  style
}: AuthSectionProps) => {
  const [footerHeight, setFooterHeight] = useState(0)
  const [viewHeight, setViewHeight] = useState(0)
  const { height: windowHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  return (
    <View
      style={[style, styles.container]}
      onLayout={(e) => setViewHeight(e.nativeEvent.layout.height)}
    >
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
        keyboardVerticalOffset={windowHeight - viewHeight}
      >
        <View onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}>
          <Animated.View layout={TiFDefaultLayoutTransition}>
            <TiFFooterView>
              {footer}
              <PrimaryButton
                style={[
                  styles.callToActionButton,
                  { opacity: isCallToActionDisabled ? 0.5 : 1 }
                ]}
                disabled={isCallToActionDisabled}
                onPress={onCallToActionTapped}
                accessibilityLabel={callToActionTitle}
              >
                {callToActionTitle}
              </PrimaryButton>
            </TiFFooterView>
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
  <AuthLayoutView
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
