import { Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { Password } from "@auth/Password"
import React, { useState } from "react"
import { Alert, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useMutation } from "@tanstack/react-query"
import { AuthFormView, BaseAuthFormSubmission } from "./AuthSection"
import { AuthShadedPasswordTextField } from "./AuthTextFields"

export type ChangePasswordResult = "valid" | "invalid" | "incorrect-password"

export type ChangePasswordErrorReason =
  | "current-matches-new"
  | "reenter-does-not-match-new"
  | "weak-new-password"
  | "incorrect-current-password"

export type UseChangePasswordFormEnvironment = {
  onSubmitted: (
    uncheckedOldPass: string,
    newPass: Password
  ) => Promise<ChangePasswordResult>
  onSuccess: () => void
}

export type ChangePasswordSubmission =
  | {
      status: "invalid"
      error?: ChangePasswordErrorReason
    }
  | BaseAuthFormSubmission

export type ChangePasswordFormFields = {
  currentPassword: string
  newPassword: string
  reEnteredPassword: string
}

export const useChangePasswordForm = ({
  onSubmitted,
  onSuccess
}: UseChangePasswordFormEnvironment) => {
  const [fields, setFields] = useState({
    currentPassword: "",
    newPassword: "",
    reEnteredPassword: ""
  })

  const passwordResult = Password.validate(fields.newPassword)

  const mutation = useMutation(
    async (password: Password) => {
      return await onSubmitted(fields.currentPassword, password)
    },
    {
      onSuccess,
      onError: (_, password: Password) => {
        Alert.alert(
          "Whoops",
          "Sorry, something went wrong when trying to change your password. Please try again.",
          [
            { text: "Try Again", onPress: () => mutation.mutate(password) },
            { text: "Ok" }
          ]
        )
      }
    }
  )

  return {
    fields,
    updateField: (key: keyof ChangePasswordFormFields, value: string) => {
      setFields((fields) => ({ ...fields, [key]: value }))
    },
    get submission (): ChangePasswordSubmission {
      if (
        fields.currentPassword === "" &&
        fields.newPassword === "" &&
        fields.reEnteredPassword === ""
      ) {
        return { status: "invalid" }
      } else if (fields.currentPassword === fields.newPassword) {
        return { status: "invalid", error: "current-matches-new" }
      } else if (fields.reEnteredPassword !== fields.newPassword) {
        return { status: "invalid", error: "reenter-does-not-match-new" }
      } else if (!passwordResult) {
        return { status: "invalid", error: "weak-new-password" }
      } else if (mutation.isLoading) {
        return { status: "submitting" }
      } else if (mutation.data === "incorrect-password") {
        return { status: "invalid", error: "incorrect-current-password" }
      } else {
        return {
          status: "submittable",
          submit: () => mutation.mutate(passwordResult)
        }
      }
    }
  }
}

export type ChangePasswordFormProps = {
  style?: StyleProp<ViewStyle>
  fields: ChangePasswordFormFields
  updateField: (key: keyof ChangePasswordFormFields, value: string) => void
  submission: ChangePasswordSubmission
  onForgotPasswordTapped: () => void
}

export const ChangePasswordFormView = ({
  style,
  fields,
  updateField,
  submission,
  onForgotPasswordTapped
}: ChangePasswordFormProps) => (
  <AuthFormView
    title="Change Password"
    description="Your new password must at least be 8 characters and contain at least 1 letter, 1 number, and 1 special character."
    submissionTitle="Change Password"
    submission={submission}
    style={style}
  >
    <AuthShadedPasswordTextField
      iconName="lock-closed"
      iconBackgroundColor="#FB3640"
      value={fields.currentPassword}
      placeholder="Current Password"
      error={
        submission.status === "invalid" &&
        submission.error === "incorrect-current-password"
          ? "Your old password was entered incorrectly. Please enter it again."
          : undefined
      }
      onChangeText={(text) => updateField("currentPassword", text)}
      style={styles.textField}
    />

    <AuthShadedPasswordTextField
      iconName="lock-closed"
      iconBackgroundColor="#FB3640"
      value={fields.newPassword}
      placeholder="New Password"
      error={
        submission.status === "invalid"
          ? newPasswordErrorMessage(submission.error)
          : undefined
      }
      onChangeText={(text) => updateField("newPassword", text)}
      style={styles.textField}
    />

    <AuthShadedPasswordTextField
      iconName="lock-closed"
      iconBackgroundColor="#FB3640"
      value={fields.reEnteredPassword}
      placeholder="Re-Enter New Password"
      error={
        submission.status === "invalid" &&
        submission.error === "reenter-does-not-match-new"
          ? "Your new password does not match, please enter it here again."
          : undefined
      }
      onChangeText={(text) => updateField("reEnteredPassword", text)}
      style={styles.textField}
    />

    <TouchableOpacity onPress={onForgotPasswordTapped}>
      <Headline style={{ color: AppStyles.highlightedText }}>
        Forgot your password?
      </Headline>
    </TouchableOpacity>
  </AuthFormView>
)

const newPasswordErrorMessage = (error?: ChangePasswordErrorReason) => {
  if (error === "current-matches-new") {
    return "Your new password must be different from your old password."
  } else if (error === "weak-new-password") {
    return "Your password should be at least 8 characters, and contain at least 1 capital letter, number, and special character."
  } else {
    return undefined
  }
}

const styles = StyleSheet.create({
  flexColumn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15
  },
  container: {
    backgroundColor: "white"
  },
  paddingIconSection: {
    paddingVertical: 8,
    backgroundColor: "white"
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: "65%"
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
    marginBottom: 16
  }
})
