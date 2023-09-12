import { AuthFormView, BaseAuthFormSubmission } from "@auth/AuthSection"
import { AuthShadedTextField } from "@auth/AuthTextFields"
import { BodyText } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { useMutation } from "@tanstack/react-query"
import React, { useState } from "react"
import { StyleProp, ViewStyle, StyleSheet, Alert, View } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { TextToastView } from "@components/common/Toasts"

export type AuthResendVerificationCodeStatus = "success" | "error"

export type AuthVerificationCodeFormInvalidReason =
  | "code-too-short"
  | "code-too-long"
  | "invalid-code"

export type AuthVerificationCodeFormSubmission =
  | {
      status: "invalid"
      reason: AuthVerificationCodeFormInvalidReason
    }
  | BaseAuthFormSubmission

export type UseAuthVerificationCodeFormEnvironment = {
  resendCode: () => Promise<void>
  checkCode: (code: string) => Promise<boolean>
  onSuccess: () => void
}

/**
 * A hook to manage the form state for a verification code form.
 */
export const useAuthVerificationCodeForm = ({
  resendCode,
  checkCode,
  onSuccess
}: UseAuthVerificationCodeFormEnvironment) => {
  const [code, setCode] = useState("")
  const resendCodeMutation = useMutation(resendCode)
  const checkCodeMutation = useMutation(checkCode, {
    onSuccess: (isValidCode: boolean) => {
      if (isValidCode) {
        onSuccess()
      } else {
        Alert.alert(
          "Invalid Code",
          "The code you have entered is invalid, please try again."
        )
      }
    },
    onError: () => {
      Alert.alert(
        "Whoops!",
        "Something went wrong trying to submit your code. Please try again."
      )
    }
  })
  const hasSubmittedInvalidCode = checkCodeMutation.data === false
  return {
    code,
    onCodeChanged: (code: string) => {
      checkCodeMutation.reset()
      setCode(code)
    },
    resendCodeStatus:
      resendCodeMutation.isError || resendCodeMutation.isSuccess
        ? resendCodeMutation.status
        : undefined,
    onCodeResent: resendCodeMutation.mutate,
    get submission (): AuthVerificationCodeFormSubmission {
      if (hasSubmittedInvalidCode) {
        return { status: "invalid", reason: "invalid-code" }
      } else if (checkCodeMutation.isLoading) {
        return { status: "submitting" }
      } else if (code.length === 6) {
        return {
          status: "submittable",
          submit: () => checkCodeMutation.mutate(code)
        }
      } else {
        return {
          status: "invalid",
          reason: code.length < 6 ? "code-too-short" : "code-too-long"
        }
      }
    }
  }
}

export type AuthVerificationCodeProps = {
  code: string
  onCodeChanged: (code: string) => void
  submission: AuthVerificationCodeFormSubmission
  resendCodeStatus?: AuthResendVerificationCodeStatus
  onCodeResent: () => void
  codeReceiverName: string
  style?: StyleProp<ViewStyle>
}

/**
 * A view for the user to verify their account with a 2FA code during auth flows
 * (sign-up, forgot password, etc.).
 */
export const AuthVerificationCodeFormView = ({
  code,
  onCodeChanged,
  submission,
  resendCodeStatus,
  onCodeResent,
  codeReceiverName,
  style
}: AuthVerificationCodeProps) => (
  <>
    <AuthFormView
      title="Verify your Account"
      description={`We have sent a 6-digit verification code to ${codeReceiverName}. Please enter it in the field below.`}
      footer={
        <View style={styles.resendContainer}>
          <BodyText style={styles.resendText}>
            Didn&apos;t receive a code?{" "}
          </BodyText>
          <TouchableOpacity onPress={onCodeResent}>
            <BodyText style={styles.resendLinkText}>Resend it.</BodyText>
          </TouchableOpacity>
        </View>
      }
      submissionTitle="Verify me!"
      submission={submission}
      style={style}
    >
      <AuthShadedTextField
        iconName="barcode-outline"
        iconBackgroundColor="#FB5607"
        placeholder="Enter the 6-digit code"
        textContentType="oneTimeCode"
        keyboardType="number-pad"
        error={
          submission.status === "invalid"
            ? errorMessageForInvalidSubmissionReason(submission.reason)
            : undefined
        }
        value={code}
        onChangeText={onCodeChanged}
        autoFocus
      />
    </AuthFormView>
    <TextToastView
      isVisible={resendCodeStatus === "success"}
      text={`We have resent the code to ${codeReceiverName}.`}
    />
    <TextToastView
      isVisible={resendCodeStatus === "error"}
      text={`We were unable to resend the code to ${codeReceiverName}, please try again.`}
    />
  </>
)

const errorMessageForInvalidSubmissionReason = (
  reason: AuthVerificationCodeFormInvalidReason
) => {
  if (reason === "invalid-code") {
    return "The code you have entered is invalid, please try again."
  } else if (reason === "code-too-long") {
    return "The code should only 6-digits."
  } else {
    return undefined
  }
}

const styles = StyleSheet.create({
  resendTextContainer: {
    textAlign: "center",
    opacity: 1
  },
  resendText: {
    opacity: 0.5
  },
  resendLinkText: {
    color: AppStyles.linkColor,
    opacity: 1
  },
  resendContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  }
})
