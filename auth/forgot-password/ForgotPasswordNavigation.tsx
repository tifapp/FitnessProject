import { StackNavigatorType } from "@components/Navigation"
import {} from "@lib/users"
import { StackScreenProps } from "@react-navigation/stack"
import { useRef } from "react"
import { Alert } from "react-native"
import {
  AuthVerificationCodeFormView,
  EmailAddress,
  Password,
  USPhoneNumber,
  useAuthVerificationCodeForm
} from ".."
import {
  ForgotPasswordFormView,
  useForgotPasswordForm
} from "./ForgotPasswordForm"
import {
  ResetPasswordFormView,
  ResetPasswordResult,
  useResetPasswordForm
} from "./ResetPasswordForm"

export type ForgotPasswordEnvironment = {
  initiateForgotPassword: (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  ) => Promise<void>
  initiateResetPassword: (newPass: Password) => Promise<ResetPasswordResult>
  finishVerifyingAccount: (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    verificationCode: string
  ) => Promise<"invalid-verification-code" | string>
}

export type ForgotPasswordParamsList = {
  forgotPassword: { emailOrPhoneNumber: EmailAddress | USPhoneNumber }
  verifyCode: {
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
    code?: string
  }
  resetPassword: { code: string }
}

type ForgotPasswordScreenProps = StackScreenProps<
  ForgotPasswordParamsList,
  "forgotPassword"
> & {
  initiateForgotPassword: (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  ) => Promise<void>
}

type VerifyCodeScreenProps = StackScreenProps<
  ForgotPasswordParamsList,
  "verifyCode"
> & {
  finishVerifyingAccount: (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    verificationCode: string
  ) => Promise<"invalid-verification-code" | string>
}

type ResetPasswordScreenProps = StackScreenProps<
  ForgotPasswordParamsList,
  "resetPassword"
> & {
  initiateResetPassword: (newPass: Password) => Promise<ResetPasswordResult>
}

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
        {(props: any) => (
          <VerifyCodeScreen
            {...props}
            finishVerifyingAccount={env.finishVerifyingAccount}
          />
        )}
      </stack.Screen>

      <stack.Screen name="resetPassword">
        {(props: any) => (
          <ResetPasswordScreen
            {...props}
            initiateResetPassword={env.initiateResetPassword}
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

const VerifyCodeScreen = ({
  navigation,
  route,
  finishVerifyingAccount
}: VerifyCodeScreenProps) => {
  const generatedRef = useRef<string | undefined>()
  const form = useAuthVerificationCodeForm({
    resendCode: async () => {},
    submitCode: async (code: string) => {
      const result = await finishVerifyingAccount(
        route.params.emailOrPhoneNumber,
        code
      )
      if (result === "invalid-verification-code") {
        return false
      }
      generatedRef.current = result
      return true
    },
    onSuccess: () => {
      if (generatedRef.current) {
        navigation.navigate("resetPassword", {
          code: generatedRef.current
        })
      }
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
  initiateResetPassword
}: ResetPasswordScreenProps) => {
  const resetPassword = useResetPasswordForm({
    initiateResetPassword,
    onSuccess: () => navigation.goBack(),
    onError: () => {
      Alert.alert(
        "Whoops",
        "Sorry, something went wrong when trying to reset your password. Please try again.",
        [{ text: "Ok" }]
      ),
      navigation.goBack()
    }
  })
  return <ResetPasswordFormView {...resetPassword} code={route.params.code} />
}
