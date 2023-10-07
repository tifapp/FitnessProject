import { AuthFormView } from "@auth/AuthSection"
import { AuthShadedEmailPhoneTextFieldView } from "@auth/AuthTextFields"
import { EmailAddress } from "@auth/Email"
import { useEmailPhoneTextState } from "@auth/UseEmailPhoneText"
import { useFormSubmission } from "@hooks/FormHooks"
import { AppStyles } from "@lib/AppColorStyle"
import { Alert, StyleProp, StyleSheet, ViewStyle } from "react-native"
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
  return (
    <AuthFormView
      title={"Forgot Your Password?"}
      description={
        "Please enter in your valid email or phone number. A verification code will be sent to your account's email, that will be used to reset your password."
      }
      submissionTitle={"Reset Password"}
      submission={submission}
      style={style}
    >
      <AuthShadedEmailPhoneTextFieldView
        iconBackgroundColor={AppStyles.darkColor}
        value={forgotPasswordText.text}
        activeTextType={forgotPasswordText.activeTextType}
        onChangeText={forgotPasswordText.onTextChanged}
        onActiveTextTypeToggled={forgotPasswordText.onActiveTextTypeToggled}
        style={styles.emailPhoneTextField}
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
  }
})
