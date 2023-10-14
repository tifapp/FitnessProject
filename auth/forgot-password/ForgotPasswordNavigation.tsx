import { StackNavigatorType } from "@components/Navigation"
import {} from "@lib/users"
import { StackScreenProps } from "@react-navigation/stack"
import { Alert } from "react-native"
import { EmailAddress, Password, USPhoneNumber } from ".."
import {
  AuthVerificationCodeFormView,
  useAuthVerificationCodeForm
} from "../VerifyCode"
import { ForgotPasswordEnvironment } from "./Environment"
import {
  ForgotPasswordFormView,
  useForgotPasswordForm
} from "./ForgotPasswordForm"
import {
  ResetPasswordFormView,
  useResetPasswordForm
} from "./ResetPasswordForm"

export type ForgotPasswordParamsList = {
  forgotPassword: undefined
  verifyCode: {
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
    code?: string
    newPass?: Password
  }
  resetPassword: {
    initialPassword?: Password
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
    code: string
  }
}

type ForgotPasswordScreenProps = StackScreenProps<
  ForgotPasswordParamsList,
  "forgotPassword"
> &
  Pick<ForgotPasswordEnvironment, "initiateForgotPassword">

type VerifyCodeScreenProps = StackScreenProps<
  ForgotPasswordParamsList,
  "verifyCode"
> &
  Pick<ForgotPasswordEnvironment, "initiateForgotPassword">

type ResetPasswordScreenProps = StackScreenProps<
  ForgotPasswordParamsList,
  "resetPassword"
> &
  Pick<ForgotPasswordEnvironment, "submitResettedPassword">

export const createForgotPasswordScreens = <T extends ForgotPasswordParamsList>(
  stack: StackNavigatorType<T>,
  env: ForgotPasswordEnvironment
) => {
  return (
    <>
      <stack.Screen name="forgotPassword">
        {(props: any) => (
          <ForgotPasswordScreen
            {...props}
            initiateForgotPassword={env.initiateForgotPassword}
          />
        )}
      </stack.Screen>

      <stack.Screen name="verifyCode">
        {(props: any) => <VerifyCodeScreen {...props} />}
      </stack.Screen>

      <stack.Screen name="resetPassword">
        {(props: any) => (
          <ResetPasswordScreen
            {...props}
            submitResettedPassword={env.submitResettedPassword}
          />
        )}
      </stack.Screen>
    </>
  )
}

const ForgotPasswordScreen = ({
  navigation,
  initiateForgotPassword
}: ForgotPasswordScreenProps) => {
  const forgotPassword = useForgotPasswordForm({
    initiateForgotPassword,
    onSuccess: (emailOrPhoneNumber) => {
      navigation.replace("verifyCode", {
        emailOrPhoneNumber
      })
    }
  })
  return <ForgotPasswordFormView {...forgotPassword} />
}

const VerifyCodeScreen = ({ navigation, route }: VerifyCodeScreenProps) => {
  const form = useAuthVerificationCodeForm({
    resendCode: async () => {},
    submitCode: async (code) => {
      return { isCorrect: true, data: code }
    },
    onSuccess: (code) => {
      navigation.navigate("resetPassword", {
        initialPassword: route.params.newPass,
        code,
        emailOrPhoneNumber: route.params.emailOrPhoneNumber
      })
    }
  })
  return (
    <AuthVerificationCodeFormView
      {...form}
      iOSInModal
      codeReceiverName={route.params.emailOrPhoneNumber.formattedForPrivacy}
    />
  )
}

const ResetPasswordScreen = ({
  route,
  navigation,
  submitResettedPassword
}: ResetPasswordScreenProps) => {
  const resetPassword = useResetPasswordForm(route.params.initialPassword, {
    submitResettedPassword: (newPass) =>
      submitResettedPassword(
        route.params.emailOrPhoneNumber,
        route.params.code,
        newPass
      ),
    onSuccess: (result, newPass) => {
      if (result === "valid") navigation.pop(2)
      else {
        Alert.alert(
          "Invalid Verification Code",
          "The verification code that you have entered is invalid.",
          [{ text: "Ok" }]
        )
        navigation.replace("verifyCode", {
          emailOrPhoneNumber: route.params.emailOrPhoneNumber,
          code: route.params.code,
          newPass
        })
      }
    }
  })
  return <ResetPasswordFormView {...resetPassword} />
}
