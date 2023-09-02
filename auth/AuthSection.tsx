import { Title, BodyText } from "@components/Text"
import { PrimaryButton } from "@components/common/Buttons"
import { useKeyboardState } from "@hooks/Keyboard"
import { useHeaderHeight } from "@react-navigation/stack"
import React, { ReactNode, useState } from "react"
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

export type AuthSectionProps = {
  title: string
  description: string
  children: ReactNode
  footer?: JSX.Element
  callToActionTitle: string
  style?: StyleProp<ViewStyle>
}

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
  style
}: AuthSectionProps) => {
  const [footerHeight, setFooterHeight] = useState(0)
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
        <Title>{title}</Title>
        <BodyText style={styles.descriptionText}>{description}</BodyText>
        {children}
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
          {footer}
          <PrimaryButton
            title={callToActionTitle}
            style={styles.callToActionButton}
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
  descriptionText: {
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
  fieldsContainer: {
    padding: 16
  },
  callToActionButton: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 8
  }
})