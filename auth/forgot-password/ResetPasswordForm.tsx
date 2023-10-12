import { AuthFormView } from "@auth/AuthSection"
import { AuthShadedPasswordTextField } from "@auth/AuthTextFields"
import { useFormSubmission } from "@hooks/FormHooks"
import { AppStyles } from "@lib/AppColorStyle"
import { useState } from "react"
import { Alert, StyleProp, StyleSheet, ViewStyle } from "react-native"
import Animated, { Layout } from "react-native-reanimated"
import { ChangePasswordNewPasswordError, Password } from ".."

/**
 * A type to help show what props need to be given in order to utilize {@link useForgotPasswordForm}.
 */
export type UseResetPasswordFormEnvironment = {
  initiateResetPassword: (newPass: Password) => Promise<ResetPasswordResult>
  onSuccess: () => void
  onError: () => void
  code?: string
}

export type ResetPasswordResult = "valid" | "invalid-password"

export const useResetPasswordForm = ({
  initiateResetPassword,
  onSuccess,
  onError
}: UseResetPasswordFormEnvironment) => {
  const [newPasswordField, setNewPasswordField] = useState("")
  const validatedNewPassword = Password.validate(newPasswordField)

  return {
    newPasswordField,
    submission: useFormSubmission(
      async (args) => {
        return await initiateResetPassword(args.newPass)
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
        onSuccess,
        onError
      }
    ),
    onTextChanged: (text: string) => setNewPasswordField(text)
  }
}

const checkForNewPasswordError = (
  newPassword: string,
  validatedNewPassword?: Password
): ChangePasswordNewPasswordError | undefined => {
  if (newPassword === "") {
    return "empty"
  } else if (!validatedNewPassword) {
    return "weak-new-password"
  } else {
    return undefined
  }
}

const newPasswordErrorMessage = (error?: ChangePasswordNewPasswordError) => {
  if (error === "weak-new-password") {
    return "Your password should be at least 8 characters, and contain at least 1 capital letter, number, and special character."
  } else {
    return undefined
  }
}

export type ResetPasswordFormProps = {
  code: string
  style?: StyleProp<ViewStyle>
} & ReturnType<typeof useResetPasswordForm>

export const ResetPasswordFormView = ({
  style,
  submission,
  code,
  newPasswordField,
  onTextChanged
}: ResetPasswordFormProps) => {
  return (
    <AuthFormView
      title={"Reset Password"}
      description={
        "Your new password must at least be 8 characters and contain at least 1 letter, 1 number, and 1 special character."
      }
      submissionTitle={"Change Password"}
      submission={submission}
      style={style}
    >
      <Animated.View layout={Layout.springify()}>
        <AuthShadedPasswordTextField
          iconName="lock-closed"
          iconBackgroundColor="#FB3640"
          style={styles.textField}
          value={newPasswordField}
          placeholder="New Password"
          error={
            submission.status === "invalid"
              ? newPasswordErrorMessage(submission.newPasswordError)
              : undefined
          }
          onChangeText={(text) => onTextChanged(text)}
        />
      </Animated.View>
    </AuthFormView>
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
