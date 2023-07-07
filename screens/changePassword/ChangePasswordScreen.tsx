import { BodyText, Headline } from "@components/Text"
import { PrimaryButton } from "@components/common/Buttons"
import { validationProcedure } from "@hooks/validationMethods"
import { AppStyles } from "@lib/AppColorStyle"
import { Auth } from "aws-amplify"
import React, { useState } from "react"
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native"
import { TextField } from "./TextField"

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
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [reEnteredPassword, setReEnteredPassword] = useState("")
  const [isValidForm, setIsValidForm] = useState(false)

  const tapChangePassword = () => {
    const submit = () => {
      changePassword(currentPassword, newPassword)
    }
    const validatePassword = (password: string) => {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/
      return passwordRegex.test(password)
    }
    if (!validationProcedure(validatePassword, newPassword)) {
      // Return error given by validationProcedure
      setIsValidForm(false)
    } else {
      // Allow the next thing to happen
      submit()
      setIsValidForm(true)
    }
    return isValidForm
  }

  return (
    <SafeAreaView
      style={[
        styles.flexColumn,
        styles.paddingIconSection,
        { backgroundColor: "white" }
      ]}
    >
      <ScrollView>
        <BodyText
          style={{ color: AppStyles.colorOpacity35, paddingBottom: 20 }}
        >
          Your new password should at least be 8 characters and contain at least
          1 letter, 1 number, and 1 special character.
        </BodyText>

        <TextField
          placeholder="Current Password"
          title={"Current Password"}
          style={{ flex: 1 }}
          onChangeText={(text) => setCurrentPassword(text)}
        />

        <TextField
          placeholder="New Password"
          title={"New Password"}
          style={{ flex: 1 }}
          value={newPassword}
          onChangeText={(text) => setNewPassword(text)}
        />

        <TextField
          placeholder="Re-enter New Password"
          title={"Re-Enter Password"}
          style={{ flex: 1 }}
          value={reEnteredPassword}
          onChangeText={(text) => setReEnteredPassword(text)}
        />

        <Headline style={{ color: "blue" }}> Forgot your password? </Headline>

        <View style={[styles.buttons, { marginTop: "65%" }]}>
          <PrimaryButton
            style={{
              flex: 1,
              backgroundColor: isValidForm
                ? AppStyles.darkColor
                : AppStyles.colorOpacity35
            }}
            title="Add Friend"
            onPress={() => {
              console.log(newPassword), tapChangePassword()
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
    paddingVertical: 8
  },
  buttons: {
    flexDirection: "row",
    marginTop: 20
  }
})
