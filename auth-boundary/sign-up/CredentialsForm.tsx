import { AuthFormView } from "../AuthLayout"
import {
  AuthShadedEmailPhoneTextFieldView,
  AuthShadedPasswordTextField,
  AuthShadedTextField
} from "../AuthTextFields"
import {
  EmailPhoneTextToggleFooterView,
  useEmailPhoneTextState
} from "../EmailPhoneText"
import { Caption } from "@components/Text"
import { TextFieldRefValue } from "@components/TextFields"
import { useFormSubmission } from "@lib/utils/Form"
import { AppStyles } from "@lib/AppColorStyle"
import React, { useRef, useState } from "react"
import { StyleProp, ViewStyle, StyleSheet, Alert } from "react-native"
import { EmailAddress, Password, USPhoneNumber } from ".."
import Animated from "react-native-reanimated"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import { CreateAccountResult } from "./Environment"

export type SignUpCredentialsFormFields = {
  name: string
  emailPhoneNumberText: string
  passwordText: string
}

export type UseSignUpCredentialsFormEnvironment = {
  createAccount: (
    name: string,
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    password: Password
  ) => Promise<CreateAccountResult>
  onSuccess: (emailOrPhoneNumber: EmailAddress | USPhoneNumber) => void
}

/**
 * A hook for allowing the user to create new account credentials.
 */
export const useSignUpCredentialsForm = ({
  createAccount,
  onSuccess
}: UseSignUpCredentialsFormEnvironment) => {
  const emailPhoneText = useEmailPhoneTextState("phone")
  const [baseFields, setBaseFields] = useState({
    name: "",
    passwordText: ""
  })
  const validatedPassword = Password.validate(baseFields.passwordText)
  return {
    fields: {
      ...baseFields,
      emailPhoneText: emailPhoneText.text
    },
    onFieldUpdated: (
      fieldName: keyof SignUpCredentialsFormFields,
      value: string
    ) => {
      if (fieldName === "emailPhoneNumberText") {
        emailPhoneText.onTextChanged(value)
      } else {
        setBaseFields((fields) => ({ ...fields, [fieldName]: value }))
      }
    },
    emailPhoneTextType: emailPhoneText.activeTextType,
    onEmailPhoneTextTypeToggled: () => {
      emailPhoneText.onActiveTextTypeToggled()
    },
    submission: useFormSubmission(
      async (args) => {
        return await createAccount(
          args.name,
          args.emailOrPhoneNumber,
          args.password
        )
      },
      () => {
        const nameReason = checkForNameError(baseFields.name)
        const emailPhoneReason = emailPhoneText.errorReason
        const passwordReason = checkForPasswordError(
          baseFields.passwordText,
          validatedPassword
        )
        const isError = !!nameReason || !!emailPhoneReason || !!passwordReason

        if (emailPhoneText.parsedValue && validatedPassword && !isError) {
          return {
            status: "submittable",
            submissionValues: {
              name: baseFields.name,
              password: validatedPassword,
              emailOrPhoneNumber: emailPhoneText.parsedValue
            }
          }
        }
        return {
          status: "invalid",
          nameReason,
          emailPhoneReason,
          passwordReason
        }
      },
      {
        onSuccess: (result, args) => {
          if (result === "success") {
            onSuccess(args.emailOrPhoneNumber)
          } else {
            Alert.alert(
              result === "email-already-exists"
                ? "Email already exists"
                : "Phone number already exists",
              result === "email-already-exists"
                ? "This email is being used for another account."
                : "This phone number is being used for another account."
            )
          }
        },
        onError: () => {
          Alert.alert(
            "Whoops!",
            "Something went wrong when trying to create your account, please try again."
          )
        }
      }
    )
  }
}

const checkForNameError = (name: string) => {
  return name.length === 0 ? ("empty" as const) : undefined
}

const checkForPasswordError = (
  passwordText: string,
  validatedPassword: Password | undefined
) => {
  if (passwordText.length === 0) return "empty" as const
  return !validatedPassword ? ("too-short" as const) : undefined
}

export type SignUpCredentialsFormProps = {
  onTermsAndConditionsTapped: () => void
  onPrivacyPolicyTapped: () => void
  style?: StyleProp<ViewStyle>
} & ReturnType<typeof useSignUpCredentialsForm>

/**
 * The form the user uses to enter their initial information to create an account.
 */
export const SignUpCredentialsFormView = ({
  fields,
  onFieldUpdated,
  emailPhoneTextType,
  onEmailPhoneTextTypeToggled,
  submission,
  onPrivacyPolicyTapped,
  onTermsAndConditionsTapped,
  style
}: SignUpCredentialsFormProps) => {
  const emailPhoneRef = useRef<TextFieldRefValue>(null)
  const passwordRef = useRef<TextFieldRefValue>(null)
  const [isFocusingEmailPhone, setIsFocusingEmailPhone] = useState(false)
  return (
    <AuthFormView
      title="Create your Account"
      description="Welcome to tiF! Begin your fitness journey by creating an account."
      submissionTitle="I'm ready!"
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
      <AuthShadedTextField
        iconName="person"
        iconBackgroundColor={AppStyles.linkColor}
        returnKeyType="next"
        autoFocus
        value={fields.name}
        onChangeText={(text) => onFieldUpdated("name", text)}
        blurOnSubmit={false}
        onSubmitEditing={() => emailPhoneRef.current?.focus()}
        placeholder="Name"
      />
      <AuthShadedEmailPhoneTextFieldView
        activeTextType={emailPhoneTextType}
        onActiveTextTypeToggled={onEmailPhoneTextTypeToggled}
        blurOnSubmit={false}
        value={fields.emailPhoneText}
        onChangeText={(text) => onFieldUpdated("emailPhoneNumberText", text)}
        errorReason={
          submission.status === "invalid"
            ? submission.emailPhoneReason
            : undefined
        }
        returnKeyType="next"
        ref={emailPhoneRef}
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
          onChangeText={(text) => onFieldUpdated("passwordText", text)}
          ref={passwordRef}
          error={
            submission.status === "invalid" &&
            submission.passwordReason === "too-short"
              ? "Your password must be at least 8 characters"
              : undefined
          }
          style={styles.textField}
        />
      </Animated.View>
      <Animated.View layout={TiFDefaultLayoutTransition}>
        <Caption style={styles.disclaimerText}>
          <Caption>By creating an account, you agree to the </Caption>
          <Caption
            onPress={onTermsAndConditionsTapped}
            style={styles.legalLinkText}
          >
            terms and conditions
          </Caption>
          <Caption> and </Caption>
          <Caption onPress={onPrivacyPolicyTapped} style={styles.legalLinkText}>
            privacy policy
          </Caption>
          .
        </Caption>
      </Animated.View>
    </AuthFormView>
  )
}

const styles = StyleSheet.create({
  textField: {
    marginTop: 16
  },
  disclaimerText: {
    textAlign: "center",
    opacity: 1,
    marginTop: 16
  },
  disclaimerTextBlock: {
    opacity: 0.5
  },
  legalLinkText: {
    color: AppStyles.linkColor,
    opacity: 1
  }
})
