import { BodyText, Headline } from "@components/Text"
import { PasswordTextField } from "@components/TextFields"
import { PrimaryButton } from "@components/common/Buttons"
import { AppStyles } from "@lib/AppColorStyle"
import { Password } from "@lib/Password"
import { Auth } from "aws-amplify"
import React, { useState } from "react"
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useMutation } from "react-query"

const isValidForm = false

type ChangePasswordProps = {
  onSubmitted: (
    uncheckedOldPass: string,
    newPass: Password
  ) => Promise<ChangePasswordResult>
  onSuccess: () => void
}

type ChangePasswordSubmission =
  | { status: "valid"; submit: () => void }
  | {
      status: "invalid"
      submit?: undefined
      error: ChangePasswordErrorReason
    }
  | { status: "submitting" }

type ChangePasswordErrorReason =
  | "current-matches-new"
  | "reenter-does-not-match-new"
  | "weak-new-password"
  | "incorrect-current-password"

export type ChangePasswordResult = "valid" | "invalid" | "incorrect-password"

export const changePassword = async (
  uncheckedOldPass: string,
  newPass: Password
) => {
  return await Auth.currentAuthenticatedUser()
    .then((user) => {
      return Auth.changePassword(user, uncheckedOldPass, newPass.rawValue)
    })
    .then<ChangePasswordResult>((data) => "valid")
    .catch<ChangePasswordResult>((err) => "invalid")
}

export const useChangePassword = ({
  onSubmitted,
  onSuccess
}: ChangePasswordProps) => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [reEnteredPassword, setReEnteredPassword] = useState("")

  const [fields, setFields] = useState({
    currentPassword: "",
    newPassword: "",
    reEnteredPassword: ""
  })

  const passwordResult = Password.validate(newPassword)

  const mutation = useMutation(
    async () => {
      if (passwordResult) {
        return await onSubmitted(currentPassword, passwordResult)
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

  console.log(mutation.isLoading)

  const errorReason = () => {
    if (currentPassword === newPassword) {
      return { status: "invalid", error: "current-matches-new" }
    } else if (reEnteredPassword !== newPassword) {
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
    ...fields,
    updateField: (key: keyof typeof fields, value: string) => {
      setFields((fields) => ({ ...fields, [key]: value }))
    },
    submission: errorReason()
  }
}

type FormSubmission =
  | { status: "valid"; submit: () => void }
  | { status: "invalid"; errors: string[] }

export const ChangePasswordScreen = () => {
  // Function activated on button tap
  const {
    currentPassword,
    newPassword,
    reEnteredPassword,
    updateField,
    submission
  } = useChangePassword({
    onSubmitted: changePassword,
    onSuccess: () => console.log("Success")
  })

  return (
    <SafeAreaView style={[styles.flexColumn, styles.paddingIconSection]}>
      <ScrollView>
        <BodyText style={styles.bodyText}>
          Your new password must at least be 8 characters and contain at least 1
          letter, 1 number, and 1 special character.
        </BodyText>

        <PasswordTextField
          style={styles.textField}
          value={currentPassword}
          onChangeText={(text) => updateField("currentPassword", text)}
        />

        <PasswordTextField
          style={styles.textField}
          value={newPassword}
          onChangeText={(text) => updateField("newPassword", text)}
        />

        <PasswordTextField
          style={styles.textField}
          value={reEnteredPassword}
          onChangeText={(text) => updateField("reEnteredPassword", text)}
        />

        <TouchableOpacity>
          <Headline style={{ color: "blue" }}> Forgot your password? </Headline>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            disabled={!isValidForm}
            style={isValidForm ? styles.activeButton : styles.inactiveButton}
            title="Change Password"
            onPress={() => {
              useChangePassword
            }}
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
