import { useState } from "react"
import { USPhoneNumber } from "./PhoneNumber"
import { EmailAddress } from "./Email"

export type EmailPhoneTextType = "email" | "phone"

export const toggleEmailPhoneTextType = (
  textType: EmailPhoneTextType
): EmailPhoneTextType => {
  return textType === "email" ? "phone" : "email"
}

/**
 * A hook that enabled seemless text editing for text fields that require
 * either email or phone number input.
 *
 * @param initialTextType Used to choose whether the email text or phone text is active first.
 */
export const useEmailPhoneTextState = (initialTextType: EmailPhoneTextType) => {
  const [emailText, setEmailText] = useState("")
  const [phoneNumberText, setPhoneNumberText] = useState("")
  const [activeTextType, switchActiveTextTypeTo] =
    useState<EmailPhoneTextType>(initialTextType)
  return {
    text: activeTextType === "email" ? emailText : phoneNumberText,
    onTextChanged: (text: string) => {
      if (activeTextType === "phone") {
        setPhoneNumberText(text)
      } else {
        setEmailText(text)
      }
    },
    activeTextType,
    switchActiveTextTypeTo,
    parsedValue:
      activeTextType === "phone"
        ? USPhoneNumber.parse(phoneNumberText)
        : EmailAddress.parse(emailText)
  }
}
