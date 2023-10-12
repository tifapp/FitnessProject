import { AuthFormView } from "@auth/AuthSection"
import { AuthShadedEmailPhoneTextFieldView } from "@auth/AuthTextFields"
import { EmailAddress } from "@auth/Email"
import { useEmailPhoneTextState } from "@auth/UseEmailPhoneText"
import { BodyText } from "@components/Text"
import { TextFieldRefValue } from "@components/TextFields"
import { useFormSubmission } from "@hooks/FormHooks"
import { AppStyles } from "@lib/AppColorStyle"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import { useRef, useState } from "react"
import {
  Alert,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle
} from "react-native"
import Animated, { SlideInLeft, SlideOutLeft } from "react-native-reanimated"
import { USPhoneNumber } from ".."

/**
 * A type to help show what props need to be given in order to utilize {@link useForgotPasswordForm}.
 */
export type UseForgotPasswordFormEnvironment = {
  initiateForgotPassword: (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  ) => Promise<void>
  onSuccess: (emailOrPhoneNumber: EmailAddress | USPhoneNumber) => void
}

export const useForgotPasswordForm = ({
  initiateForgotPassword,
  onSuccess
}: UseForgotPasswordFormEnvironment) => {
  const forgotPasswordText = useEmailPhoneTextState("phone")
  return {
    forgotPasswordText,
    submission: useFormSubmission(
      async (args) => {
        await initiateForgotPassword(args.emailOrPhoneNumber)
      },
      () => {
        if (forgotPasswordText.parsedValue) {
          return {
            status: "submittable",
            submissionValues: {
              emailOrPhoneNumber: forgotPasswordText.parsedValue
            }
          }
        } else {
          return {
            status: "invalid",
            error:
              forgotPasswordText.activeTextType === "email"
                ? "invalid-email"
                : "invalid-phone-number"
          } as const
        }
      },
      {
        onSuccess: (_, args) => onSuccess(args.emailOrPhoneNumber),
        onError: () => {
          Alert.alert(
            "Whoops",
            "Sorry, something went wrong when trying to change your password. Please try again.",
            [{ text: "Ok" }]
          )
        }
      }
    )
  }
}

export type ForgotPasswordFormProps = {
  style?: StyleProp<ViewStyle>
} & ReturnType<typeof useForgotPasswordForm>

export const ForgotPasswordFormView = ({
  style,
  submission,
  forgotPasswordText
}: ForgotPasswordFormProps) => {
  const emailPhoneRef = useRef<TextFieldRefValue>(null)
  const [isFocusingEmailPhone, setIsFocusingEmailPhone] = useState(false)
  return (
    <AuthFormView
      title={"Forgot Your Password?"}
      description={
        "Please enter in your valid email or phone number. A verification code will be sent to your account's email, that will be used to reset your password."
      }
      submissionTitle={"Reset Password"}
      submission={submission}
      style={style}
      footer={
        <Animated.View layout={TiFDefaultLayoutTransition}>
          {isFocusingEmailPhone && (
            <Animated.View
              entering={SlideInLeft.duration(300)}
              exiting={SlideOutLeft.duration(300)}
            >
              <TouchableOpacity
                onPress={forgotPasswordText.onActiveTextTypeToggled}
              >
                <BodyText style={styles.emailPhoneToggle}>
                  {forgotPasswordText.activeTextType === "email"
                    ? "Use phone number instead."
                    : "Use email instead."}
                </BodyText>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      }
    >
      <AuthShadedEmailPhoneTextFieldView
        iconBackgroundColor={AppStyles.darkColor}
        value={forgotPasswordText.text}
        activeTextType={forgotPasswordText.activeTextType}
        onChangeText={forgotPasswordText.onTextChanged}
        blurOnSubmit={false}
        onActiveTextTypeToggled={forgotPasswordText.onActiveTextTypeToggled}
        style={styles.emailPhoneTextField}
        ref={emailPhoneRef}
        onFocus={() => setIsFocusingEmailPhone(true)}
        onBlur={() => setIsFocusingEmailPhone(false)}
      />
    </AuthFormView>
  )
}

const styles = StyleSheet.create({
  emailPhoneTextField: {
    flex: 1
  },
  container: {
    backgroundColor: "white"
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: "110%"
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
    marginTop: 16,
    fontFamily: "OpenSans",
    textAlign: "left"
  },
  emailPhoneToggle: {
    color: AppStyles.linkColor,
    paddingBottom: 8
  }
})
