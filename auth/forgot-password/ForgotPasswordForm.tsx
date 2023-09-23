import { AuthSectionView } from "@auth/AuthSection"
import { AuthShadedTextField } from "@auth/AuthTextFields"
import { EmailAddress } from "@auth/Email"
import { AppStyles } from "@lib/AppColorStyle"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { Alert, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { USPhoneNumber } from ".."

/**
 * A type to determine what result ForgotPassword should give on submission.
 */
export type ForgotPasswordResult = "valid" | "invalid" | "invalid-email"

/**
 * A type to help show what current format {@link useForgotPasswordForm} is using for text fields: An {@link EmailAddress}, or a {@link USPhoneNumber}.
 */

export type ForgotPasswordTextFormat = EmailAddress | USPhoneNumber

/**
 * A type to help show what props need to be given in order to utilize {@link useForgotPasswordForm}.
 */
export type UseForgotPasswordFormEnvironment = {
  onSubmitted: (emailResult: EmailAddress) => Promise<ForgotPasswordResult>
  textFormat: ForgotPasswordTextFormat
  onSuccess: () => void
}

/**
 * A type to help show what errors {@link ForgotPasswordSubmission} is allowed to give on an invalid submission.
 */

export type ForgotPasswordErrorReason =
  | "invalid-phone-number"
  | "invalid-email"
  | "undefined"

export type ForgotPasswordSubmission =
  | { status: "valid"; submit: () => void; error?: undefined }
  | {
      status: "invalid"
      submit?: undefined
      error?: ForgotPasswordErrorReason
    }
  | { status: "submitting"; submit?: undefined; error?: undefined }

export const useForgotPasswordForm = ({
  onSubmitted,
  textFormat,
  onSuccess
}: UseForgotPasswordFormEnvironment) => {
  const [currentText, setCurrentText] = useState("")

  const emailResult = EmailAddress.parse(currentText)

  const mutation = useMutation(
    async () => {
      if (emailResult) {
        return await onSubmitted(emailResult)
      }
    },
    {
      onSuccess,
      onError: () => {
        Alert.alert(
          "Whoops",
          "Sorry, something went wrong when trying to parse your email. Please try again.",
          [
            { text: "Try Again", onPress: () => mutation.mutate() },
            { text: "Ok" }
          ]
        )
      }
    }
  )

  const getSubmission = (): ForgotPasswordSubmission => {
    if (currentText === "") {
      return { status: "invalid" }
    } else if (mutation.isLoading) {
      return { status: "submitting" }
    } else if (!emailResult) {
      return { status: "invalid", error: "invalid-email" }
    } else {
      return {
        status: "valid",
        submit: mutation.mutate
      }
    }
  }

  return {
    currentText,
    updateField: (value: string) => {
      setCurrentText(value)
    },
    submission: getSubmission()
  }
}

export type ForgotPasswordFormProps = {
  style?: StyleProp<ViewStyle>
  email: string
  currentTextFormat: ForgotPasswordTextFormat
  updateField: (value: string) => void
  submission: ForgotPasswordSubmission
}

export const ForgotPasswordFormView = ({
  style,
  email,
  currentTextFormat,
  updateField,
  submission
}: ForgotPasswordFormProps) => {
  const isSubmittable =
    submission.status === "invalid" || submission.status === "submitting"
  // Function activated on button tap

  return (
    <AuthSectionView
      title={"Forgot Your Password?"}
      description={
        "Please enter in your valid email. A verification code will be sent to the email, that will be used to reset your password."
      }
      callToActionTitle={"Reset Password"}
      style={[styles.flexColumn]}
    >
      <AuthShadedTextField
        iconName="mail"
        iconBackgroundColor="#14B329"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.textField}
        value={email}
        placeholder="Email Address"
        error={
          submission.error === "invalid-email"
            ? "Your email is invalid. Please enter a valid email address."
            : undefined
        }
        onChangeText={(text) => updateField(text)}
      />
    </AuthSectionView>
  )
}

const styles = StyleSheet.create({
  flexColumn: {
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
  }
})
