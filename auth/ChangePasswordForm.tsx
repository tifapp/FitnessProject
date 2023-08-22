import { BodyText, Headline } from "@components/Text"
import { PasswordTextField } from "@components/TextFields"
import { PrimaryButton } from "@components/common/Buttons"
import { AppStyles } from "@lib/AppColorStyle"
import { Password } from "@auth/Password"
import React, { useState } from "react"
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useMutation } from "react-query"

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
  | { status: "valid"; submit: () => void; error?: undefined }
  | {
      status: "invalid"
      submit?: undefined
      error?: ChangePasswordErrorReason
    }
  | { status: "submitting"; submit?: undefined; error?: undefined }

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
    async () => {
      if (passwordResult) {
        return await onSubmitted(fields.currentPassword, passwordResult)
      }
    },

    {
      onSuccess,
      onError: () => {
        Alert.alert(
          "Whoops",
          "Sorry, something went wrong when trying to change your password. Please try again.",
          [
            { text: "Try Again", onPress: () => mutation.mutate() },
            { text: "Ok" }
          ]
        )
      }
    }
  )

  const getSubmission = (): ChangePasswordSubmission => {
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
      return { status: "valid", submit: mutation.mutate }
    }
  }

  return {
    fields,
    updateField: (key: keyof ChangePasswordFormFields, value: string) => {
      setFields((fields) => ({ ...fields, [key]: value }))
    },
    submission: getSubmission()
  }
}

export type ChangePasswordFormProps = {
  style?: StyleProp<ViewStyle>
  fields: ChangePasswordFormFields
  updateField: (key: keyof ChangePasswordFormFields, value: string) => void
  submission: ChangePasswordSubmission
}

export const ChangePasswordFormView = ({
  style,
  fields,
  updateField,
  submission
}: ChangePasswordFormProps) => {
  const isSubmittable =
    submission.status === "invalid" || submission.status === "submitting"
  // Function activated on button tap

  return (
    <SafeAreaView style={[styles.flexColumn, styles.paddingIconSection]}>
      <ScrollView>
        <BodyText style={styles.bodyText}>
          Your new password must at least be 8 characters and contain at least 1
          letter, 1 number, and 1 special character.
        </BodyText>

        <PasswordTextField
          style={styles.textField}
          value={fields.currentPassword}
          placeholder="Current Password"
          error={
            submission.error === "incorrect-current-password"
              ? "Your old password was entered incorrectly. Please enter it again."
              : undefined
          }
          onChangeText={(text) => updateField("currentPassword", text)}
        />

        <PasswordTextField
          style={styles.textField}
          value={fields.newPassword}
          placeholder="New Password"
          error={
            submission.error === "weak-new-password"
              ? "Your password should be at least 8 characters, and contain at least 1 capital letter, number, and special character."
              : submission.error === "current-matches-new"
                ? "Your new password must be different from your old password."
                : undefined
          }
          onChangeText={(text) => updateField("newPassword", text)}
        />

        <PasswordTextField
          style={styles.textField}
          value={fields.reEnteredPassword}
          placeholder="Re-Enter New Password"
          error={
            submission.error === "reenter-does-not-match-new"
              ? "Your new password does not match, please enter it here again."
              : undefined
          }
          onChangeText={(text) => updateField("reEnteredPassword", text)}
        />

        <TouchableOpacity>
          <Headline style={{ color: AppStyles.highlightedText }}>
            Forgot your password?
          </Headline>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            disabled={!isSubmittable}
            style={isSubmittable ? styles.inactiveButton : styles.activeButton}
            title="Change Password"
            onPress={() => submission.submit?.()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
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
    flex: 1,
    fontFamily: "OpenSans",
    padding: 10,
    textAlign: "left"
  }
})
