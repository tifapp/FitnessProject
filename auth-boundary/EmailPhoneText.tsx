import React, { useState } from "react"
import { USPhoneNumber, EmailAddress } from "./Models"
import { StringUtils } from "@lib/utils/String"
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle
} from "react-native"
import { BodyText } from "@components/Text"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { AppStyles } from "@lib/AppColorStyle"
import { extractNumbers } from "TiFShared/lib/String"

export type EmailPhoneTextType = "email" | "phone"

export type EmailPhoneTextErrorReason =
  | "empty"
  | "invalid-email"
  | "invalid-phone-number"

const toggleTextType = (textType: EmailPhoneTextType): EmailPhoneTextType => {
  return textType === "email" ? "phone" : "email"
}

const textTypeParser = (textType: EmailPhoneTextType) => {
  return textType === "email" ? EmailAddress : USPhoneNumber
}

/**
 * A hook that enabled seemless text editing for text fields that require
 * either email or phone number input.
 *
 * @param initialTextType Used to choose whether the email text or phone text is active first.
 */
export const useEmailPhoneTextState = (initialTextType: EmailPhoneTextType) => {
  const [text, setText] = useState({ email: "", phone: "" })
  const [activeTextType, setTextType] = useState(initialTextType)
  const activeText = text[activeTextType]
  const parsedValue = textTypeParser(activeTextType).parse(activeText)
  return {
    text:
      activeTextType === "email"
        ? activeText
        : prettyFormatIncrementalE164PhoneNumber(extractNumbers(activeText)),
    onTextChanged: (text: string) => {
      setText((t) => ({ ...t, [activeTextType]: text }))
    },
    activeTextType,
    onActiveTextTypeChanged: setTextType,
    onActiveTextTypeToggled: () => setTextType(toggleTextType),
    parsedValue,
    get errorReason(): EmailPhoneTextErrorReason | undefined {
      if (activeText.length === 0) return "empty"
      if (parsedValue) return undefined
      return activeTextType === "email"
        ? "invalid-email"
        : "invalid-phone-number"
    }
  }
}

/**
 * Formates an incremental E164 phone number string as a pretty formatted phone number.
 *
 * Ex.
 *
 * `"1234" -> "(123) 4"`
 *
 * `"1234567" -> "(123) 456-7"`
 */
export const prettyFormatIncrementalE164PhoneNumber = (
  digitString: `${number}` | ""
) => {
  if (digitString.length < 4) {
    return digitString
  } else if (digitString.length < 7) {
    return `(${digitString.substring(0, 3)}) ${digitString.slice(3)}`
  } else {
    return `(${digitString.substring(0, 3)}) ${digitString.substring(
      3,
      6
    )}-${digitString.slice(6)}`
  }
}

export type EmailPhoneTextToggleFooterProps = {
  isVisible: boolean
  textType: EmailPhoneTextType
  onTextTypeToggled: () => void
  style?: StyleProp<ViewStyle>
}

export const EmailPhoneTextToggleFooterView = ({
  isVisible,
  textType,
  onTextTypeToggled,
  style
}: EmailPhoneTextToggleFooterProps) => (
  <Animated.View layout={TiFDefaultLayoutTransition}>
    {isVisible && (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={style}
      >
        <TouchableOpacity onPress={onTextTypeToggled}>
          <BodyText style={styles.emailPhoneToggle}>
            {textType === "email"
              ? "Use phone number instead."
              : "Use email instead."}
          </BodyText>
        </TouchableOpacity>
      </Animated.View>
    )}
  </Animated.View>
)

const styles = StyleSheet.create({
  emailPhoneToggle: {
    color: AppStyles.linkColor,
    paddingBottom: 8
  }
})
