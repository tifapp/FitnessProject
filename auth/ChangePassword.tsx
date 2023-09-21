import { Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { Password } from "@auth/Password"
import React, { useRef, useState } from "react"
import { Alert, Platform, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { AuthFormView } from "./AuthSection"
import { AuthShadedPasswordTextField } from "./AuthTextFields"
import { TextFieldRefValue } from "@components/TextFields"
import Animated, { Layout } from "react-native-reanimated"
import { useFormSubmission } from "@hooks/FormHooks"

export type ChangePasswordResult = "valid" | "incorrect-password"

export type ChangePasswordCurrentPasswordError =
  | "incorrect-current-password"
  | "empty"

export type ChangePasswordNewPasswordError =
  | "current-matches-new"
  | "weak-new-password"
  | "empty"

export type UseChangePasswordFormEnvironment = {
  changePassword: (
    uncheckedOldPass: string,
    newPass: Password
  ) => Promise<ChangePasswordResult>
  onSuccess: () => void
}

export type ChangePasswordFormFields = {
  currentPassword: string
  newPassword: string
}

export const useChangePasswordForm = ({
  changePassword,
  onSuccess
}: UseChangePasswordFormEnvironment) => {
  const [fields, setFields] = useState({
    currentPassword: "",
    newPassword: ""
  })

  const attemptedCurrentPasswords = useRef<string[]>([])
  const validatedNewPassword = Password.validate(fields.newPassword)
  return {
    fields,
    onFieldUpdated: (key: keyof ChangePasswordFormFields, value: string) => {
      setFields((fields) => ({ ...fields, [key]: value }))
    },
    submission: useFormSubmission(
      async (args) => {
        return await changePassword(
          args.uncheckedCurrentPassword,
          args.newPassword
        )
      },
      () => {
        const currentPasswordError = checkForCurrentPasswordError(
          fields.currentPassword,
          attemptedCurrentPasswords.current
        )

        const newPasswordError = checkForNewPasswordError(
          fields.newPassword,
          fields.currentPassword,
          validatedNewPassword
        )

        if (
          validatedNewPassword &&
          !currentPasswordError &&
          !newPasswordError
        ) {
          return {
            status: "submittable",
            submissionValues: {
              uncheckedCurrentPassword: fields.currentPassword,
              newPassword: validatedNewPassword
            }
          }
        }

        return { status: "invalid", newPasswordError, currentPasswordError }
      },
      {
        onSuccess: (result, args) => {
          if (result === "valid") {
            onSuccess()
          } else {
            attemptedCurrentPasswords.current.push(
              args.uncheckedCurrentPassword
            )
            Alert.alert(
              "Incorrect Password",
              "You entered your current password incorrectly, please try again.",
              [{ text: "Ok" }]
            )
          }
        },
        onError: () => {
          Alert.alert(
            "Whoops",
            "Sorry, something went wrong when trying to change your password. Please try again.",
            [{ text: "Ok" }]
          )
        }
      }
    )
  }
}

const checkForNewPasswordError = (
  newPassword: string,
  currentPassword: string,
  validatedNewPassword?: Password
): ChangePasswordNewPasswordError | undefined => {
  if (newPassword === "") {
    return "empty"
  } else if (newPassword === currentPassword) {
    return "current-matches-new"
  } else if (!validatedNewPassword) {
    return "weak-new-password"
  } else {
    return undefined
  }
}

const checkForCurrentPasswordError = (
  currentPassword: string,
  attemptedPasswords: string[]
): ChangePasswordCurrentPasswordError | undefined => {
  const isCurrentPasswordIncorrect = attemptedPasswords.find(
    (p) => p === currentPassword
  )
  if (isCurrentPasswordIncorrect) {
    return "incorrect-current-password"
  } else if (currentPassword === "") {
    return "empty"
  } else {
    return undefined
  }
}

export type ChangePasswordFormProps = {
  style?: StyleProp<ViewStyle>
  onForgotPasswordTapped: () => void
} & ReturnType<typeof useChangePasswordForm>

export const ChangePasswordFormView = ({
  style,
  fields,
  onFieldUpdated,
  submission,
  onForgotPasswordTapped
}: ChangePasswordFormProps) => {
  const newPasswordRef = useRef<TextFieldRefValue>(null)
  return (
    <AuthFormView
      title="Change Password"
      description="Your new password must at least be 8 characters and contain at least 1 letter, 1 number, and 1 special character."
      submissionTitle="Change Password"
      submission={submission}
      style={style}
    >
      <AuthShadedPasswordTextField
        iconName="lock-closed"
        iconBackgroundColor={AppStyles.linkColor}
        value={fields.currentPassword}
        autoFocus
        placeholder="Current Password"
        returnKeyType={Platform.OS === "android" ? "next" : undefined}
        blurOnSubmit={false}
        onSubmitEditing={() => {
          // NB: Keep this Android exclusive for now as iOS has issues with this
          // when the focus also has secureTextEntry (ie. A PasswordTextField).
          if (Platform.OS === "android") {
            newPasswordRef.current?.focus()
          }
        }}
        error={
          submission.status === "invalid" &&
          submission.currentPasswordError === "incorrect-current-password"
            ? "Your old password was entered incorrectly. Please enter it again."
            : undefined
        }
        onChangeText={(text) => onFieldUpdated("currentPassword", text)}
        style={styles.textField}
      />

      <Animated.View layout={Layout.springify()}>
        <AuthShadedPasswordTextField
          iconName="md-key"
          iconBackgroundColor="#14B329"
          value={fields.newPassword}
          placeholder="New Password"
          returnKeyType="done"
          ref={newPasswordRef}
          error={
            submission.status === "invalid"
              ? newPasswordErrorMessage(submission.newPasswordError)
              : undefined
          }
          onChangeText={(text) => onFieldUpdated("newPassword", text)}
          style={styles.textField}
        />
      </Animated.View>
      <Animated.View layout={Layout.springify()}>
        <TouchableOpacity onPress={onForgotPasswordTapped}>
          <Headline style={{ color: AppStyles.highlightedText }}>
            Forgot your password?
          </Headline>
        </TouchableOpacity>
      </Animated.View>
    </AuthFormView>
  )
}

const newPasswordErrorMessage = (error?: ChangePasswordNewPasswordError) => {
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
