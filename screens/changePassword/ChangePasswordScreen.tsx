import { BodyText, Headline } from "@components/Text"
import { PrimaryButton } from "@components/common/Buttons"
import { TouchableIonicon } from "@components/common/Icons"
import { validatePassword } from "@hooks/validatePassword"
import { AppStyles } from "@lib/AppColorStyle"
import { Auth } from "aws-amplify"
import React, { useState } from "react"
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { TextField } from "./TextField"

const isValidForm: boolean = true
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
    const passwordRegex: RegExp =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/
    const formValid: boolean =
      oldAccountPassword === currentPassword &&
      validatePassword(newPassword) &&
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
          Your new password must at least be 8 characters and contain at least 1
          letter, 1 number, and 1 special character.
        </BodyText>

        <View>
          <TextField
            placeholder="Current Password"
            style={styles.textField}
            value={currentPassword}
            secureTextEntry={currentPasswordHidden}
            onChangeText={(text) => {
              setCurrentPassword(text)
            }}
            onBlur={() =>
              currentPassword !== oldAccountPassword
                ? Alert.alert(
                  "No Match",
                  "The entered current password does not match that of the old account's password. Please try again."
                )
                : Alert.alert("Correct match", "The password is correct")
            }
          />
          {currentPassword && (
            <TouchableIonicon
              style={{
                position: "absolute",
                top: 10,
                right: 10
              }}
              icon={{ name: "lock-closed" }}
              onPress={() => setCurrentPasswordHidden(!currentPasswordHidden)}
            />
          )}
        </View>

        <View>
          <TextField
            placeholder="New Password"
            style={styles.textField}
            value={newPassword}
            secureTextEntry={newPasswordHidden}
            onChangeText={(text) => setNewPassword(text)}
          />
          {newPassword && (
            <TouchableIonicon
              style={{
                position: "absolute",
                top: 10,
                right: 10
              }}
              icon={{ name: "lock-closed" }}
              onPress={() => setNewPasswordHidden(!newPasswordHidden)}
            />
          )}
        </View>

        <View>
          <TextField
            placeholder="Re-enter New Password"
            style={styles.textField}
            value={reEnteredPassword}
            secureTextEntry={reEnteredPasswordHidden}
            onChangeText={(text) => setReEnteredPassword(text)}
            onBlur={() =>
              reEnteredPassword !== newPassword
                ? Alert.alert(
                  "No Match",
                  "The re-entered password does not match that of the new password. Please try again."
                )
                : Alert.alert("Correct match", "The password matches.")
            }
          />
          {reEnteredPassword && (
            <TouchableIonicon
              style={{
                position: "absolute",
                top: 10,
                right: 10
              }}
              icon={{ name: "lock-closed" }}
              onPress={() =>
                setReEnteredPasswordHidden(!reEnteredPasswordHidden)
              }
            />
          )}
        </View>

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
    flex: 1,
    fontFamily: "OpenSans",
    padding: 10,
    textAlign: "left"
  }
})
