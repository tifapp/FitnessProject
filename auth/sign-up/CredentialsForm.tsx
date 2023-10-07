import { AuthFormView } from "@auth/AuthSection"
import {
  AuthShadedEmailPhoneTextFieldView,
  AuthShadedPasswordTextField,
  AuthShadedTextField
} from "@auth/AuthTextFields"
import {
  EmailPhoneTextType,
  useEmailPhoneTextState
} from "@auth/UseEmailPhoneText"
import { BodyText, Caption } from "@components/Text"
import { TextFieldRefValue } from "@components/TextFields"
import { useFormSubmission } from "@hooks/FormHooks"
import { AppStyles } from "@lib/AppColorStyle"
import React, { useRef, useState } from "react"
import { StyleProp, ViewStyle, StyleSheet, Alert } from "react-native"
import { EmailAddress, Password, USPhoneNumber } from ".."
import { TouchableOpacity } from "react-native-gesture-handler"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"

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
  ) => Promise<void>
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
        await createAccount(args.name, args.emailOrPhoneNumber, args.password)
      },
      () => {
        const nameReason = checkForNameError(baseFields.name)
        const emailPhoneReason = checkForEmailPhoneError(
          emailPhoneText.text,
          emailPhoneText.activeTextType,
          emailPhoneText.parsedValue
        )
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
        onSuccess: (_, args) => onSuccess(args.emailOrPhoneNumber),
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

const checkForEmailPhoneError = (
  text: string,
  activeTextType: EmailPhoneTextType,
  emailOrPhoneNumber: EmailAddress | USPhoneNumber | undefined
) => {
  if (text.length === 0) return "empty" as const
  if (!emailOrPhoneNumber) {
    return activeTextType === "email"
      ? ("invalid-email" as const)
      : ("invalid-phone-number" as const)
  }
  return undefined
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
      iOSInModal
      submission={submission}
      footer={
        <Animated.View layout={TiFDefaultLayoutTransition}>
          {isFocusingEmailPhone && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
            >
              <TouchableOpacity onPress={onEmailPhoneTextTypeToggled}>
                <BodyText style={styles.emailPhoneToggle}>
                  {emailPhoneTextType === "email"
                    ? "Use phone number instead."
                    : "Use email instead."}
                </BodyText>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
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
        iconBackgroundColor="#14B329"
        placeholder="Phone number or Email"
        blurOnSubmit={false}
        value={fields.emailPhoneText}
        onChangeText={(text) => onFieldUpdated("emailPhoneNumberText", text)}
        error={
          submission.status === "invalid"
            ? emailPhoneErrorText(submission.emailPhoneReason)
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

const emailPhoneErrorText = (
  error: "invalid-email" | "invalid-phone-number" | "empty" | undefined
) => {
  if (error === "invalid-email") {
    return "Please enter a valid email."
  } else if (error === "invalid-phone-number") {
    return "Please enter a valid phone number."
  } else {
    return undefined
  }
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
  },
  emailPhoneToggle: {
    color: AppStyles.linkColor,
    paddingBottom: 8
  }
})
