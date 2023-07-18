import { BodyText, Headline } from "@components/Text"
import { PrimaryButton } from "@components/common/Buttons"
import { AppStyles } from "@lib/AppColorStyle"
import { validateNewPassword } from "@lib/Password"
import { Auth } from "aws-amplify"
import React, { useState } from "react"
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { PasswordField } from "./PasswordField"

let isValidForm = false
const oldAccountPassword: string = "Icarus43$"

type ChangePasswordProps = {
  onPasswordChangeSubmitted?: (
    oldPass: string,
    newPass: string
  ) => Promise<boolean>
}

const changePassword = async (oldPass: string, newPass: string) => {
  return await Auth.currentAuthenticatedUser()
    .then((user) => {
      return Auth.changePassword(user, oldPass, newPass)
    })
    .then((data) => true)
    .catch((err) => false)
}

type FormSubmission =
  | { status: "valid"; submit: () => void }
  | { status: "invalid"; errors: string[] }

export const ChangePasswordScreen = ({
  onPasswordChangeSubmitted = changePassword
}: ChangePasswordProps) => {
  const [currentPassword, setCurrentPassword] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [reEnteredPassword, setReEnteredPassword] = useState<string>("")

  const [currentPasswordHidden, setCurrentPasswordHidden] =
    useState<boolean>(true)
  const [newPasswordHidden, setNewPasswordHidden] = useState<boolean>(true)
  const [reEnteredPasswordHidden, setReEnteredPasswordHidden] =
    useState<boolean>(true)

  const validateForm = () => {
    const formValid: boolean =
      oldAccountPassword === currentPassword &&
      validateNewPassword(newPassword) &&
      reEnteredPassword === newPassword
    isValidForm = formValid
    return formValid
  }

  // Function activated on button tap
  const tapChangePassword = () => {
    const submit = () => {
      onPasswordChangeSubmitted(currentPassword, newPassword)
    }
    const submission: FormSubmission = isValidForm
      ? { status: "valid", submit }
      : { status: "invalid", errors: [] }
    return { currentPassword, submission }
  }

  return (
    <SafeAreaView style={[styles.flexColumn, styles.paddingIconSection]}>
      <ScrollView>
        <BodyText style={styles.bodyText}>
          Your new password must at least be 8 characters and contain at least 1
          letter, 1 number, and 1 special character.
        </BodyText>

        <PasswordField title={"Current Password"} style={styles.textField} />

        <PasswordField title={"New Password"} style={styles.textField} />

        <PasswordField
          title={"Re-enter New Password"}
          style={styles.textField}
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
              validateForm()
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
