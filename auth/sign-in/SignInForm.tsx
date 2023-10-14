import React, { useRef, useState } from "react"
import {
  StyleProp,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
  Alert
} from "react-native"
import { AuthFormView } from "../AuthSection"
import {
  AuthShadedEmailPhoneTextFieldView,
  AuthShadedPasswordTextField
} from "../AuthTextFields"
import { Headline } from "@components/Text"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import Animated from "react-native-reanimated"
import { AppStyles } from "@lib/AppColorStyle"
import { TextFieldRefValue } from "@components/TextFields"
import {
  EmailPhoneTextToggleFooterView,
  useEmailPhoneTextState
} from "../EmailPhoneText"
import { useFormSubmission } from "@hooks/FormHooks"
import { USPhoneNumber } from "../PhoneNumber"
import { EmailAddress } from "../Email"
import { SignInResult } from "./Authenticator"

export type UseSignInFormEnvironment = {
  signIn: (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    uncheckedPassword: string
  ) => Promise<SignInResult>
  onSuccess: (result: Omit<SignInResult, "incorrect-credentials">) => void
}

/**
 * Hook for the main sign in form view.
 */
export const useSignInForm = ({
  signIn,
  onSuccess
}: UseSignInFormEnvironment) => {
  const emailPhoneTextState = useEmailPhoneTextState("phone")
  const [password, setPassword] = useState("")
  return {
    password,
    onPasswordChanged: setPassword,
    emailPhoneText: emailPhoneTextState.text,
    onEmailPhoneTextChanged: emailPhoneTextState.onTextChanged,
    emailPhoneTextType: emailPhoneTextState.activeTextType,
    onEmailPhoneTextTypeToggled: emailPhoneTextState.onActiveTextTypeToggled,
    submission: useFormSubmission(
      async (args) => await signIn(args.emailOrPhoneNumber, args.password),
      () => {
        const passwordReason = password.length === 0 ? "empty" : undefined
        const emailPhoneReason = emailPhoneTextState.errorReason
        const hasErrors = !!passwordReason || !!emailPhoneReason
        if (emailPhoneTextState.parsedValue && !hasErrors) {
          return {
            status: "submittable",
            submissionValues: {
              emailOrPhoneNumber: emailPhoneTextState.parsedValue,
              password
            }
          }
        }
        return { status: "invalid", passwordReason, emailPhoneReason }
      },
      {
        onSuccess: (result) => {
          if (result === "incorrect-credentials") {
            Alert.alert(
              "Incorrect Credentials",
              "Your email, phone number, or password entered was incorrectly entered."
            )
          } else {
            onSuccess(result)
          }
        },
        onError: () => {
          Alert.alert(
            "Ouch!",
            "Something went wrong when trying to sign you in... Please try again..."
          )
        }
      }
    )
  }
}

export type SignInFormProps = {
  onForgotPasswordTapped: () => void
  style?: StyleProp<ViewStyle>
} & ReturnType<typeof useSignInForm>

/**
 * The main sign in form view.
 */
export const SignInFormView = ({
  onForgotPasswordTapped,
  emailPhoneTextType,
  onEmailPhoneTextTypeToggled,
  submission,
  password,
  onPasswordChanged,
  emailPhoneText,
  onEmailPhoneTextChanged,
  style
}: SignInFormProps) => {
  const [isFocusingEmailPhone, setIsFocusingEmailPhone] = useState(true)
  const passwordRef = useRef<TextFieldRefValue>(null)
  return (
    <AuthFormView
      title="Sign In"
      description="Welcome back! Fill in the fields below and return to your fitness journey!"
      submissionTitle="I am back!"
      submission={submission}
      footer={
        <EmailPhoneTextToggleFooterView
          isVisible={isFocusingEmailPhone}
          textType={emailPhoneTextType}
          onTextTypeToggled={onEmailPhoneTextTypeToggled}
        />
      }
      style={style}
    >
      <AuthShadedEmailPhoneTextFieldView
        activeTextType={emailPhoneTextType}
        onActiveTextTypeToggled={onEmailPhoneTextTypeToggled}
        blurOnSubmit={false}
        value={emailPhoneText}
        autoFocus
        onChangeText={onEmailPhoneTextChanged}
        errorReason={
          submission.status === "invalid"
            ? submission.emailPhoneReason
            : undefined
        }
        returnKeyType="next"
        // NB: This state is needed to hide the footer button.
        onFocus={() => setIsFocusingEmailPhone(true)}
        onBlur={() => setIsFocusingEmailPhone(false)}
        onSubmitEditing={() => {
          setIsFocusingEmailPhone(false)
          passwordRef.current?.focus()
        }}
        style={styles.textField}
      />
      <Animated.View layout={TiFDefaultLayoutTransition}>
        <AuthShadedPasswordTextField
          iconName="lock-closed"
          iconBackgroundColor="#FB3640"
          placeholder="Password"
          value={password}
          onChangeText={onPasswordChanged}
          ref={passwordRef}
          style={styles.textField}
        />
      </Animated.View>
      <Animated.View layout={TiFDefaultLayoutTransition}>
        <TouchableOpacity onPress={onForgotPasswordTapped}>
          <Headline style={styles.forgotPassword}>
            Forgot your password?
          </Headline>
        </TouchableOpacity>
      </Animated.View>
    </AuthFormView>
  )
}

const styles = StyleSheet.create({
  textField: {
    marginBottom: 16
  },
  forgotPassword: {
    color: AppStyles.highlightedText
  }
})
