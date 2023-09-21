import { useState } from "react"
import {
  USPhoneNumber,
  prettyFormatIncrementalE164PhoneNumber
} from "./PhoneNumber"
import { EmailAddress } from "./Email"
import { StringUtils } from "@lib/String"

export type EmailPhoneTextType = "email" | "phone"

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
  return {
    text:
      activeTextType === "email"
        ? activeText
        : prettyFormatIncrementalE164PhoneNumber(
          StringUtils.extractNumbers(activeText)
        ),
    onTextChanged: (text: string) => {
      setText((t) => ({ ...t, [activeTextType]: text }))
    },
    activeTextType,
    switchActiveTextTypeTo: setTextType,
    toggleActiveTextType: () => setTextType(toggleTextType),
    parsedValue: textTypeParser(activeTextType).parse(activeText)
  }
}
