import { BodyText } from "@components/Text"
import { TextField } from "@components/TextFields"
import { PrimaryButton } from "@components/common/Buttons"
import { AppStyles } from "@lib/AppColorStyle"
import { useMutation } from "@tanstack/react-query"
// import { Auth } from "aws-amplify"
import { useState } from "react"
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"

// Send confirmation code to user's email
// async function forgotPassword (username: string) {
//   try {
//     const data = await Auth.forgotPassword(username)
//     console.log(data)
//   } catch (err) {
//     console.log(err)
//   }
// }

export type ForgotPasswordResult = "valid" | "invalid" | "invalid-email"

export type UseForgotPasswordFormEnvironment = {
  onSubmitted: (email: string) => Promise<ForgotPasswordResult>
  onSuccess: () => void
}

export type ForgotPasswordErrorReason = "invalid-email"

export type ForgotPasswordSubmission =
  | { status: "valid"; submit: () => void; error?: undefined }
  | {
      status: "invalid"
      submit?: undefined
      error?: ForgotPasswordErrorReason
    }
  | { status: "submitting"; submit?: undefined; error?: undefined }

export const useForgotPasswordForm = ({
  onSubmitted,
  onSuccess
}: UseForgotPasswordFormEnvironment) => {
  const [email, setEmail] = useState("")

  const mutation = useMutation(
    async () => {
      if (email) {
        return await onSubmitted(email)
      }
    },
    {
      onSuccess,
      onError: () => {
        Alert.alert(
          "Whoops",
          "Sorry, something went wrong when trying to validate your email. Please try again.",
          [
            { text: "Try Again", onPress: () => mutation.mutate() },
            { text: "Ok" }
          ]
        )
      }
    }
  )

  const getSubmission = (): ForgotPasswordSubmission => {
    if (email === "") {
      return { status: "invalid" }
    } else if (mutation.isLoading) {
      return { status: "submitting" }
    } else if (mutation.data === "invalid-email") {
      return { status: "invalid", error: "invalid-email" }
    } else {
      return { status: "valid", submit: mutation.mutate }
    }
  }

  return {
    email,
    updateField: (value: string) => {
      setEmail(value)
    },
    submission: getSubmission()
  }
}

export type ForgotPasswordFormProps = {
  style?: StyleProp<ViewStyle>
  email: string
  updateField: (value: string) => void
  submission: ForgotPasswordSubmission
}

export const ForgotPasswordFormView = ({
  style,
  email,
  updateField,
  submission
}: ForgotPasswordFormProps) => {
  const isSubmittable =
    submission.status === "invalid" || submission.status === "submitting"
  // Function activated on button tap

  return (
    <SafeAreaView style={[styles.flexColumn, styles.paddingIconSection]}>
      <ScrollView>
        <BodyText style={styles.bodyText}>
          Please enter in your valid email. A verification code will be sent to
          the email, that will be used to reset your password.
        </BodyText>

        <TextField
          style={styles.textField}
          value={email}
          placeholder="Email Address"
          error={
            submission.error === "invalid-email"
              ? "Your email is invalid. Please enter a valid email address."
              : undefined
          }
          onChangeText={(text) => updateField(text)}
        />

        <View style={styles.buttonContainer}>
          <PrimaryButton
            disabled={!isSubmittable}
            style={isSubmittable ? styles.inactiveButton : styles.activeButton}
            title="Reset Password"
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
