import { AuthFormView } from "../AuthLayout"
import { AuthShadedEmailPhoneTextFieldView } from "../AuthTextFields"
import { TextFieldRefValue } from "@components/TextFields"
import { useFormSubmission } from "@lib/utils/Form"
import { AppStyles } from "@lib/AppColorStyle"
import React, { useRef, useState } from "react"
import { Alert, StyleProp, StyleSheet, ViewStyle } from "react-native"
import {
  EmailPhoneTextToggleFooterView,
  useEmailPhoneTextState
} from "../EmailPhoneText"
import { ForgotPasswordResult } from "./Environment"
import { EmailAddress, USPhoneNumber } from "@user/privacy"

/**
 * A type to help show what props need to be given in order to utilize {@link useForgotPasswordForm}.
 */
export type UseForgotPasswordFormEnvironment = {
  initiateForgotPassword: (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  ) => Promise<ForgotPasswordResult>
  onSuccess: (emailOrPhoneNumber: EmailAddress | USPhoneNumber) => void
}

export const useForgotPasswordForm = ({
  initiateForgotPassword,
  onSuccess
}: UseForgotPasswordFormEnvironment) => {
  const forgotPasswordText = useEmailPhoneTextState("phone")
  return {
    forgotPasswordText,
    submission: useFormSubmission(
      async (args) => await initiateForgotPassword(args.emailOrPhoneNumber),
      () => {
        if (forgotPasswordText.parsedValue) {
          return {
            status: "submittable",
            submissionValues: {
              emailOrPhoneNumber: forgotPasswordText.parsedValue
            }
          }
        } else {
          return {
            status: "invalid",
            error: forgotPasswordText.errorReason
          } as const
        }
      },
      {
        onSuccess: (result, args) => {
          if (result === "success") {
            onSuccess(args.emailOrPhoneNumber)
          } else {
            Alert.alert(
              result === "invalid-email"
                ? "Invalid Email"
                : "Invalid Phone Number",
              result === "invalid-email"
                ? "No account exists with the email that you entered."
                : "No account exists with the phone number that you entered."
            )
          }
        },
        onError: () => {
          Alert.alert(
            "Whoops",
            "Sorry, something went wrong. Please try again.",
            [{ text: "Ok" }]
          )
        }
      }
    )
  }
}

export type ForgotPasswordFormProps = {
  style?: StyleProp<ViewStyle>
} & ReturnType<typeof useForgotPasswordForm>

export const ForgotPasswordFormView = ({
  style,
  submission,
  forgotPasswordText
}: ForgotPasswordFormProps) => {
  const emailPhoneRef = useRef<TextFieldRefValue>(null)
  const [isFocusingEmailPhone, setIsFocusingEmailPhone] = useState(false)
  return (
    <AuthFormView
      title={"Forgot Your Password?"}
      description={
        "A verification code will be sent to your account's email or phone number, that will be used to reset your password."
      }
      submissionTitle={"Reset Password"}
      submission={submission}
      style={style}
      footer={
        <EmailPhoneTextToggleFooterView
          isVisible={isFocusingEmailPhone}
          textType={forgotPasswordText.activeTextType}
          onTextTypeToggled={forgotPasswordText.onActiveTextTypeToggled}
        />
      }
    >
      <AuthShadedEmailPhoneTextFieldView
        value={forgotPasswordText.text}
        activeTextType={forgotPasswordText.activeTextType}
        onChangeText={forgotPasswordText.onTextChanged}
        blurOnSubmit={false}
        onActiveTextTypeToggled={forgotPasswordText.onActiveTextTypeToggled}
        style={styles.emailPhoneTextField}
        ref={emailPhoneRef}
        errorReason={
          submission.status === "invalid" ? submission.error : undefined
        }
        onFocus={() => setIsFocusingEmailPhone(true)}
        onBlur={() => setIsFocusingEmailPhone(false)}
      />
    </AuthFormView>
  )
}

const styles = StyleSheet.create({
  emailPhoneTextField: {
    flex: 1
  },
  container: {
    backgroundColor: "white"
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: "110%"
  },
  activeButton: {
    flex: 1,
    backgroundColor: AppStyles.darkColor
  },
  inactiveButton: {
    flex: 1,
    opacity: 0.5,
    backgroundColor: AppStyles.colorOpacity35
  },
  bodyText: {
    color: AppStyles.colorOpacity35,
    paddingBottom: 20
  },
  textField: {
    flex: 1,
    marginTop: 16,
    fontFamily: "OpenSans",
    textAlign: "left"
  },
  emailPhoneToggle: {
    color: AppStyles.linkColor,
    paddingBottom: 8
  }
})
