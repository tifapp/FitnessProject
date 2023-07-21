import { BodyText, Headline } from "@components/Text"
import { PasswordTextField } from "@components/TextFields"
import { PrimaryButton } from "@components/common/Buttons"
import { AppStyles } from "@lib/AppColorStyle"
import { Password } from "@lib/Password"
import { Auth } from "aws-amplify"
import React, { useState } from "react"
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useMutation } from "react-query"

const isValidForm = false

type ChangePasswordProps = {
  onPasswordChangeSubmitted?: (
    uncheckedOldPass: string,
    newPass: Password
  ) => Promise<boolean>
}

type ChangePasswordSubmission =
  | { status: "valid"; submit: () => void }
  | {
      status: "invalid"
      submit?: undefined
      error?: ChangePasswordErrorReason
    }

type ChangePasswordErrorReason =
  | "current-matches-new"
  | "reenter-does-not-match-new"
  | "weak-new-password"

type ChangePasswordSubmissionResult = "valid" | "invalid" | "incorrect-password"

export const changePassword = async (
  uncheckedOldPass: string,
  newPass: Password
) => {
  return await Auth.currentAuthenticatedUser()
    .then((user) => {
      return Auth.changePassword(user, uncheckedOldPass, newPass.rawValue)
    })
    .then((data) => true)
    .catch((err) => false)
}

export const useChangePassword = ({
  onPasswordChangeSubmitted = changePassword
}: ChangePasswordProps) => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [reEnteredPassword, setReEnteredPassword] = useState("")

  const passwordResult = Password.validate(newPassword)

  const mutation = useMutation(async () => {
    if (passwordResult) {
      await onPasswordChangeSubmitted(currentPassword, passwordResult)
    }
  })

  console.log(mutation.isLoading)

  const errorReason = () => {
    if (currentPassword === newPassword) {
      return { status: "invalid", error: "current-matches-new" }
    } else if (reEnteredPassword !== newPassword) {
      return { status: "invalid", error: "reenter-does-not-match-new" }
    } else {
      if (!passwordResult) {
        return { status: "invalid", error: "weak-new-password" }
      } else if (mutation.isLoading) {
        return { status: "invalid" }
      } else {
        return { status: "valid", submit: mutation.mutate }
      }
    }
  }

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    reEnteredPassword,
    setReEnteredPassword,
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
    setCurrentPassword,
    newPassword,
    setNewPassword,
    reEnteredPassword,
    setReEnteredPassword,
    submission
  } = useChangePassword({ onPasswordChangeSubmitted: changePassword })

  const [isCurrentPwdShowing, setIsCurrentPwdShowing] = useState(false)
  const [isNewPwdShowing, setIsNewPwdShowing] = useState(false)
  const [isReEnteredPwdShowing, setIsReEnteredPwdShowing] = useState(false)

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
          onChangeText={(text) => setCurrentPassword(text)}
          onShowPasswordContentsChanged={setIsCurrentPwdShowing}
          isShowingPasswordContents={isCurrentPwdShowing}
        />

        <PasswordTextField
          style={styles.textField}
          value={newPassword}
          onChangeText={(text) => setNewPassword(text)}
          onShowPasswordContentsChanged={setIsNewPwdShowing}
          isShowingPasswordContents={isNewPwdShowing}
        />

        <PasswordTextField
          style={styles.textField}
          value={reEnteredPassword}
          onChangeText={(text) => setReEnteredPassword(text)}
          onShowPasswordContentsChanged={setIsReEnteredPwdShowing}
          isShowingPasswordContents={isReEnteredPwdShowing}
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
