import { BodyText, Headline } from "@components/Text"
import { PrimaryButton } from "@components/common/Buttons"
import { AppStyles } from "@lib/AppColorStyle"
import { Auth } from "aws-amplify"
import React, { useState } from "react"
import { StyleSheet, View } from "react-native"
import { TextField } from "./TextField"
import { validationProcedure } from "@hooks/ValidationMethods"

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

const beginChangePassword = () => {}

export const ChangePasswordScreen = ({
  onPasswordChangeSubmitted = changePassword
}: ChangePasswordProps) => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [reEnteredPassword, setReEnteredPassword] = useState("")
  const [isValidForm, setIsValidForm] = useState(false)

  const tapChangePassword = () => {
    /*
      Check for conditions on password go here:
      Incorrect states:
    */
    const submit = () => {
      changePassword(currentPassword, newPassword)
    }
    const validatePassword = (password: string) => {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/
      return passwordRegex.test(password)
    }
    if (!validationProcedure(validatePassword, newPassword)) {
      // Return error given by validationProcedure, I think
      return false
    } else {
      // Allow the next thing to happen
      submit()
      return true
    }
  }

  return (
    <View
      style={[
        styles.flexColumn,
        styles.paddingIconSection,
        { backgroundColor: "white" }
      ]}
    >
      <View>
        <BodyText
          style={{ color: AppStyles.colorOpacity35, paddingBottom: 20 }}
        >
          Your new password should at least be 8 characters and contain at least
          1 letter, 1 number, and 1 special character.
        </BodyText>
      </View>

      <TextField
        placeholder="Current Password"
        title={"Current Password"}
        style={{ flex: 1 }}
        onChangeText={(onChangeText) => setCurrentPassword(onChangeText)}
      />

      <TextField
        placeholder="New Password"
        title={"New Password"}
        style={{ flex: 1 }}
        onChangeText={(onChangeText) => setNewPassword(onChangeText)}
      />

      <TextField
        placeholder="Re-enter New Password"
        title={"Re-Enter Password"}
        style={{ flex: 1 }}
        onChangeText={(onChangeText) => setReEnteredPassword(onChangeText)}
      />

      <Headline style={{ color: "blue" }}> Forgot your password? </Headline>

      <View style={[styles.spacing, styles.buttons, { marginTop: "65%" }]}>
        <PrimaryButton
          style={{
            flex: 1,
            backgroundColor: isValidForm
              ? AppStyles.darkColor
              : AppStyles.colorOpacity35
          }}
          title="Add Friend"
          onPress={() => tapChangePassword}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flexColumn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
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
  },
  spacing: {
    paddingHorizontal: 16
  }
})
