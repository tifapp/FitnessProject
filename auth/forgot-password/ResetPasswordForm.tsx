import { AuthFormView } from "@auth/AuthLayout"
import { AuthShadedPasswordTextField } from "@auth/AuthTextFields"
import { useFormSubmission } from "@hooks/FormHooks"
import React, { useState } from "react"
import { Alert, StyleProp, ViewStyle } from "react-native"
import { Password } from ".."
import { ResetPasswordResult } from "./Environment"

/**
 * A type to help show what props need to be given in order to utilize {@link useForgotPasswordForm}.
 */
export type UseResetPasswordFormEnvironment = {
  submitResettedPassword: (newPass: Password) => Promise<ResetPasswordResult>
  onSuccess: (result: ResetPasswordResult, newPass: Password) => void
}

export const useResetPasswordForm = (
  initialPassword: Password | undefined,
  { submitResettedPassword, onSuccess }: UseResetPasswordFormEnvironment
) => {
  const [newPasswordField, setNewPasswordField] = useState(
    initialPassword?.toString() ?? ""
  )
  const validatedNewPassword = Password.validate(newPasswordField)

  return {
    newPasswordField,
    submission: useFormSubmission(
      async (args) => {
        return await submitResettedPassword(args.newPass)
      },
      () => {
        const newPasswordError = checkForNewPasswordError(
          newPasswordField,
          validatedNewPassword
        )

        if (validatedNewPassword && !newPasswordError) {
          return {
            status: "submittable",
            submissionValues: {
              newPass: validatedNewPassword
            }
          }
        }
        return { status: "invalid", newPasswordError }
      },
      {
        onSuccess: (data, args) => onSuccess(data, args.newPass),
        onError: () =>
          Alert.alert(
            "Whoops",
            "Sorry, something went wrong when trying to reset your password. Please try again.",
            [{ text: "Ok" }]
          )
      }
    ),
    onTextChanged: (text: string) => setNewPasswordField(text)
  }
}

const checkForNewPasswordError = (
  newPassword: string,
  validatedNewPassword?: Password
) => {
  if (newPassword === "") {
    return "empty" as const
  } else if (!validatedNewPassword) {
    return "weak-new-password" as const
  } else {
    return undefined
  }
}

const newPasswordErrorMessage = (error?: "weak-new-password" | "empty") => {
  if (error === "weak-new-password") {
    return "Your password should be at least 8 characters."
  } else {
    return undefined
  }
}

export type ResetPasswordFormProps = {
  style?: StyleProp<ViewStyle>
} & ReturnType<typeof useResetPasswordForm>

export const ResetPasswordFormView = ({
  style,
  submission,
  newPasswordField,
  onTextChanged
}: ResetPasswordFormProps) => {
  return (
    <AuthFormView
      title={"Reset Password"}
      description={"Your new password must at least be 8 characters."}
      submissionTitle={"Change Password"}
      submission={submission}
      style={style}
    >
      <AuthShadedPasswordTextField
        iconName="lock-closed"
        iconBackgroundColor="#FB3640"
        value={newPasswordField}
        placeholder="New Password"
        error={
          submission.status === "invalid"
            ? newPasswordErrorMessage(submission.newPasswordError)
            : undefined
        }
        onChangeText={(text) => onTextChanged(text)}
      />
    </AuthFormView>
  )
}
