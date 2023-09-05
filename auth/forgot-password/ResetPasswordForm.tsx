import { Password } from "@auth/Password"
import { BodyText, Headline } from "@components/Text"
import { PasswordTextField } from "@components/TextFields"
import { PrimaryButton } from "@components/common/Buttons"
import { AppStyles } from "@lib/AppColorStyle"
import { useMutation } from "@tanstack/react-query"
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

  const mutation = useMutation(
    async () => {
      if (passwordResult) {
        return await onSubmitted(passwordResult)
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

  const getSubmission = (): ResetPasswordSubmission => {
    if (fields.newPassword === "" && fields.reEnteredPassword === "") {
      return { status: "invalid" }
    } else if (fields.reEnteredPassword !== fields.newPassword) {
      return { status: "invalid", error: "reenter-does-not-match-new" }
    } else if (!passwordResult) {
      return { status: "invalid", error: "weak-new-password" }
    } else if (mutation.isLoading) {
      return { status: "submitting" }
    } else {
      return { status: "valid", submit: mutation.mutate }
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
    <SafeAreaView style={[styles.flexColumn, styles.paddingIconSection]}>
      <ScrollView>
        <BodyText style={styles.bodyText}>
          Your new password must at least be 8 characters and contain at least 1
          letter, 1 number, and 1 special character.
        </BodyText>

        <PasswordTextField
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
