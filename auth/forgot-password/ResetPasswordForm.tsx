import { AuthSectionView } from "@auth/AuthSection"
import { AuthShadedPasswordTextField } from "@auth/AuthTextFields"
import { Password } from "@auth/Password"
import { AppStyles } from "@lib/AppColorStyle"
import React, { useState } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"

export type ResetPasswordResult = "valid" | "invalid"

export type ResetPasswordErrorReason =
  | "reenter-does-not-match-new"
  | "weak-new-password"

export type UseResetPasswordFormEnvironment = {
  onSubmitted: (newPass: Password) => Promise<ResetPasswordResult>
  onSuccess: () => void
}

export type ResetPasswordSubmission =
  | { status: "valid"; submit: () => void; error?: undefined }
  | {
      status: "invalid"
      submit?: undefined
      error?: ResetPasswordErrorReason
    }
  | { status: "submitting"; submit?: undefined; error?: undefined }

export type ResetPasswordFormFields = {
  newPassword: string
  reEnteredPassword: string
}

export const useResetPasswordForm = ({
  onSubmitted,
  onSuccess
}: UseResetPasswordFormEnvironment) => {
  const [fields, setFields] = useState({
    newPassword: "",
    reEnteredPassword: ""
  })

  const passwordResult = Password.validate(fields.newPassword)

  //   const mutation = useMutation(
  //     async () => {
  //       if (passwordResult) {
  //         return await onSubmitted(passwordResult)
  //       }
  //     },
  //     {
  //       onSuccess,
  //       onError: () => {
  //         Alert.alert(
  //           "Whoops",
  //           "Sorry, something went wrong when trying to change your password. Please try again.",
  //           [
  //             { text: "Try Again", onPress: () => mutation.mutate() },
  //             { text: "Ok" }
  //           ]
  //         )
  //       }
  //     }
  //   )

  //   const getSubmission = (): ResetPasswordSubmission => {
  //     if (fields.newPassword === "" && fields.reEnteredPassword === "") {
  //       return { status: "invalid" }
  //     } else if (fields.reEnteredPassword !== fields.newPassword) {
  //       return { status: "invalid", error: "reenter-does-not-match-new" }
  //     } else if (!passwordResult) {
  //       return { status: "invalid", error: "weak-new-password" }
  //     } else if (mutation.isLoading) {
  //       return { status: "submitting" }
  //     } else {
  //       return { status: "valid", submit: mutation.mutate }
  //     }
  //   }

  const getSubmission = (): ResetPasswordSubmission => {
    if (fields.newPassword === "" && fields.reEnteredPassword === "") {
      return { status: "invalid" }
    } else if (fields.reEnteredPassword !== fields.newPassword) {
      return { status: "invalid", error: "reenter-does-not-match-new" }
    } else if (!passwordResult) {
      return { status: "invalid", error: "weak-new-password" }
    } else {
      return {
        status: "valid",
        submit: () => console.log("Reset Password Submitted")
      }
    }
  }
  return {
    fields,
    updateField: (key: keyof ResetPasswordFormFields, value: string) => {
      setFields((fields) => ({ ...fields, [key]: value }))
    },
    submission: getSubmission()
  }
}

export type ResetPasswordFormProps = {
  style?: StyleProp<ViewStyle>
  fields: ResetPasswordFormFields
  updateField: (key: keyof ResetPasswordFormFields, value: string) => void
  submission: ResetPasswordSubmission
}

export const ResetPasswordFormView = ({
  style,
  fields,
  updateField,
  submission
}: ResetPasswordFormProps) => {
  const isSubmittable =
    submission.status === "invalid" || submission.status === "submitting"
  // Function activated on button tap

  return (
    <AuthSectionView
      title={"Reset Password"}
      description={
        "Your new password must at least be 8 characters and contain at least 1 letter, 1 number, and 1 special character."
      }
      callToActionTitle={"Change Password"}
      style={[styles.flexColumn]}
    >
      <AuthShadedPasswordTextField
        iconName="lock-closed"
        iconBackgroundColor="#FB3640"
        style={styles.textField}
        value={fields.newPassword}
        placeholder="New Password"
        error={
          submission.error === "weak-new-password"
            ? "Your password should be at least 8 characters, and contain at least 1 capital letter, number, and special character."
            : undefined
        }
        onChangeText={(text) => updateField("newPassword", text)}
      />

      <AuthShadedPasswordTextField
        iconName="lock-closed"
        iconBackgroundColor="#FB3640"
        style={styles.textField}
        value={fields.reEnteredPassword}
        placeholder="Re-enter New Password"
        error={
          submission.error === "reenter-does-not-match-new"
            ? "Your new password does not match, please enter it here again."
            : undefined
        }
        onChangeText={(text) => updateField("reEnteredPassword", text)}
      />
    </AuthSectionView>
  )
}

const styles = StyleSheet.create({
  flexColumn: {
    flex: 1
  },
  container: {
    backgroundColor: "white",
    flex: 1
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: "90%"
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
    paddingBottom: 16
  },
  textField: {
    flex: 1,
    marginTop: 16
  }
})
