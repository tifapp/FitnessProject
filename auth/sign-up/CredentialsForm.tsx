import { AuthFormView } from "@auth/AuthSection"
import {
  AuthShadedPasswordTextField,
  AuthShadedTextField
} from "@auth/AuthTextFields"
import {
  toggleEmailPhoneTextType,
  useEmailPhoneTextState
} from "@auth/UseEmailPhoneTextState"
import { BodyText, Caption } from "@components/Text"
import { TextFieldRefValue } from "@components/TextFields"
import { useFormSubmission } from "@hooks/FormHooks"
import { AppStyles } from "@lib/AppColorStyle"
import React, { useRef, useState } from "react"
import { StyleProp, ViewStyle, StyleSheet, Alert } from "react-native"
import { EmailAddress, USPhoneNumber } from ".."
import { TouchableOpacity } from "react-native-gesture-handler"
import Animated, { SlideInLeft, SlideOutLeft } from "react-native-reanimated"
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
    uncheckedPassword: string
  ) => Promise<void>
  onSuccess: () => void
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
    toggleEmailPhoneTextType: () => {
      emailPhoneText.switchActiveTextTypeTo(toggleEmailPhoneTextType)
    },
    submission: useFormSubmission(
      async (args) => {
        await createAccount(
          args.name,
          args.emailOrPhoneNumber!,
          args.passwordText
        )
      },
      () => {
        const isEmailPhoneTextEmpty = emailPhoneText.text === ""
        const isEmpty =
          baseFields.name === "" ||
          baseFields.passwordText === "" ||
          isEmailPhoneTextEmpty

        if (emailPhoneText.parsedValue && !isEmpty) {
          return {
            status: "submittable",
            submissionValues: {
              ...baseFields,
              emailOrPhoneNumber: emailPhoneText.parsedValue
            }
          }
        }
        if (!emailPhoneText.parsedValue && !isEmailPhoneTextEmpty) {
          return {
            status: "invalid",
            reason:
              emailPhoneText.activeTextType === "email"
                ? "invalid-email"
                : "invalid-phone-number"
          } as const
        }
        return {
          status: "invalid",
          reason: "one-or-more-fields-empty"
        } as const
      },
      {
        onSuccess,
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
  toggleEmailPhoneTextType,
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
        <Animated.View layout={TiFDefaultLayoutTransition}>
          {isFocusingEmailPhone && (
            <Animated.View
              entering={SlideInLeft.duration(300)}
              exiting={SlideOutLeft.duration(300)}
            >
              <TouchableOpacity onPress={toggleEmailPhoneTextType}>
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
      <AuthShadedTextField
        iconName={emailPhoneTextType === "phone" ? "phone-portrait" : "mail"}
        iconBackgroundColor="#14B329"
        placeholder="Phone number or Email"
        keyboardType={
          emailPhoneTextType === "phone" ? "phone-pad" : "email-address"
        }
        autoCapitalize="none"
        autoCorrect={false}
        blurOnSubmit={false}
        value={fields.emailPhoneText}
        onChangeText={(text) => onFieldUpdated("emailPhoneNumberText", text)}
        error={
          submission.status === "invalid"
            ? emailPhoneErrorText(submission.reason)
            : undefined
        }
        returnKeyType="next"
        ref={emailPhoneRef}
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
          style={styles.textField}
        />
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
  error: "one-or-more-fields-empty" | "invalid-email" | "invalid-phone-number"
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
