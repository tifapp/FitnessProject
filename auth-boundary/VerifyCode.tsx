import { AuthFormView } from "./AuthLayout"
import { AuthShadedTextField } from "./AuthTextFields"
import { BodyText } from "@components/Text"
import { TextToastView } from "@components/common/Toasts"
import { useFormSubmission } from "@lib/utils/Form"
import { AppStyles } from "@lib/AppColorStyle"
import { useMutation } from "@tanstack/react-query"
import React, { useRef, useState } from "react"
import { Alert, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { PrivacyFormattable } from "./Models"

export type AuthResendVerificationCodeStatus = "success" | "error"

export type AuthVerifyCodeResult<Data> =
  | { isCorrect: false }
  | { isCorrect: true; data: Data }

export type UseAuthVerificationCodeFormEnvironment<Data> = {
  resendCode: () => Promise<void>
  submitCode: (code: string) => Promise<AuthVerifyCodeResult<Data>>
  onSuccess: (data: Data) => void
}

/**
 * A hook to manage the form state for a verification code form.
 */
export const useAuthVerificationCodeForm = <Data,>({
  resendCode,
  submitCode,
  onSuccess
}: UseAuthVerificationCodeFormEnvironment<Data>) => {
  const [code, setCode] = useState("")
  const attemptedCodesRef = useRef<string[]>([])
  const resendCodeMutation = useMutation(resendCode)
  const isInvalidCode = !!attemptedCodesRef.current.find((c) => code === c)
  return {
    code,
    onCodeChanged: setCode,
    resendCodeStatus:
      resendCodeMutation.isError || resendCodeMutation.isSuccess
        ? resendCodeMutation.status
        : undefined,
    onCodeResent: () => resendCodeMutation.mutate(),
    submission: useFormSubmission(
      submitCode,
      () => {
        if (isInvalidCode) {
          return { status: "invalid", reason: "invalid-code" } as const
        }
        if (code.length !== 6) {
          return {
            status: "invalid",
            reason: code.length < 6 ? "code-too-short" : "code-too-long"
          } as const
        }
        return {
          status: "submittable",
          submissionValues: code
        }
      },
      {
        onSuccess: (result, code) => {
          if (result.isCorrect) {
            onSuccess(result.data)
          } else {
            Alert.alert(
              "Invalid Code",
              `${code} is an invalid code, please try again.`
            )
            attemptedCodesRef.current.push(code)
          }
        },
        onError: () => {
          Alert.alert(
            "Whoops!",
            "Something went wrong trying to submit your code. Please try again."
          )
        }
      }
    )
  }
}

export type AuthVerificationCodeProps = {
  code: string
  codeReceiverName: PrivacyFormattable
  style?: StyleProp<ViewStyle>
} & ReturnType<typeof useAuthVerificationCodeForm>

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
      description={`We have sent a 6-digit verification code to ${codeReceiverName.formattedForPrivacy}. Please enter it in the field below.`}
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
      text={`We have resent the code to ${codeReceiverName.formattedForPrivacy}.`}
    />
    <TextToastView
      isVisible={resendCodeStatus === "error"}
      text={`We were unable to resend the code to ${codeReceiverName.formattedForPrivacy}, please try again.`}
    />
  </>
)

const errorMessageForInvalidSubmissionReason = (
  reason: "code-too-short" | "code-too-long" | "invalid-code"
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
