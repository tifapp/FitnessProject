import { BodyText, Headline } from "@components/Text"
import { PrimaryButton } from "@components/common/Buttons"
import { validatePassword } from "@hooks/validatePassword"
import { AppStyles } from "@lib/AppColorStyle"
import { Auth } from "aws-amplify"
import React, { useState } from "react"
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { TextField } from "./TextField"

const isValidForm: boolean = false
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

  const validateForm = () => {
    const passwordRegex: RegExp =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/
    const formValid: boolean =
      oldAccountPassword === currentPassword &&
      validatePassword(newPassword, passwordRegex) &&
      reEnteredPassword === newPassword
    console.log("Got it as: ", formValid)
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
          Your new password should at least be 8 characters and contain at least
          1 letter, 1 number, and 1 special character.
        </BodyText>

        <TextField
          placeholder="Current Password"
          title={"Current Password"}
          style={styles.textField}
          value={currentPassword}
          onChangeText={(text) => {
            setCurrentPassword(text)
          }}
        />

        <TextField
          placeholder="New Password"
          title={"New Password"}
          style={styles.textField}
          value={newPassword}
          onChangeText={(text) => setNewPassword(text)}
        />

        <TextField
          placeholder="Re-enter New Password"
          title={"Re-Enter Password"}
          style={styles.textField}
          value={reEnteredPassword}
          onChangeText={(text) => setReEnteredPassword(text)}
        />

        <TouchableOpacity>
          <Headline style={{ color: "blue" }}> Forgot your password? </Headline>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            style={styles.button}
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
  button: {
    flex: 1,
    backgroundColor: isValidForm
      ? AppStyles.darkColor
      : AppStyles.colorOpacity35
  },
  bodyText: {
    color: AppStyles.colorOpacity35,
    paddingBottom: 20
  },
  textField: {
    flex: 1
  }
})
