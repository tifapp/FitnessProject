import { Caption } from "@components/Text"
import { TouchableIonicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { Password, PasswordErrorReason } from "@lib/Password"
import { useState } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { TextField } from "./TextField"

export type passwordFieldProps = {
  title: string
  style?: StyleProp<ViewStyle>
}

export const PasswordField = ({ title, style }: passwordFieldProps) => {
  const [passwordHidden, setPasswordHidden] = useState<boolean>(true)
  const [currentText, setCurrentText] = useState<string>("")
  const [currentError, setCurrentError] =
    useState<PasswordErrorReason>(undefined)

  const errorReasonToErrorText = (errorReason: PasswordErrorReason) => {
    if (errorReason === "no-capitals") {
      return "Choose a more secure password. It should have at least one capital letter."
    } else if (errorReason === "no-numbers") {
      return "Choose a more secure password. It should have at least one number."
    } else if (errorReason === "no-special-chars") {
      return "Choose a more secure password. It should have at least one special character."
    } else if (errorReason === "too-short") {
      return "Choose a more secure password. It should be at least 8 characters long."
    } else {
      return ""
    }
  }

  return (
    <View style={{ paddingBottom: 8 }}>
      <TextField
        placeholder={title}
        style={[styles.textField, style]}
        value={currentText}
        secureTextEntry={passwordHidden}
        onChangeText={(text) => setCurrentText(text)}
        onBlur={() => {
          const passwordResult = Password.validate(currentText)
          if (passwordResult.status === "invalid") {
            setCurrentError(passwordResult.errorReason)
          } else {
            setCurrentError(undefined)
            setCurrentText(passwordResult.password.rawValue)
          }
        }}
      />
      {currentText && (
        <TouchableIonicon
          style={{
            position: "absolute",
            top: 10,
            right: 10
          }}
          icon={{ name: "lock-closed" }}
          onPress={() => setPasswordHidden(!passwordHidden)}
        />
      )}
      {currentError && (
        <Caption style={styles.errorText}>
          {errorReasonToErrorText(currentError)}
        </Caption>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  textField: {
    flex: 1,
    fontFamily: "OpenSans",
    padding: 10,
    textAlign: "left"
  },
  errorText: {
    flex: 1,
    color: AppStyles.errorColor,
    opacity: 1
  }
})
