import { AuthSectionView } from "@auth/AuthSection"
import { AuthShadedTextField } from "@auth/AuthTextFields"
import { Ionicon } from "@components/common/Icons"
import React from "react"
import { StyleProp, ViewStyle } from "react-native"

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

/**
 * A view which allows the user optionally edit their user handle during sign up.
 *
 * This gives them the chance to differ their handle from the one we generated.
 */
export const CreateAccountUserHandleFormView = ({
  currentHandleText,
  onCurrentHandleTextChanged,
  invalidHandleReason,
  style
}: CreateAccountUserHandleFormProps) => (
  <AuthSectionView
    title="Pick your Username"
    description="We have created a username for you, but you can customize it if you don't like it. It's also possible to change it later if you want to."
    callToActionTitle="I like this name!"
    style={style}
  >
    <AuthShadedTextField
      iconName="at-outline"
      iconBackgroundColor="#A882DD"
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
    />
  </AuthSectionView>
)
