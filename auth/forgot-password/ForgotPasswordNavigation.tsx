import { StackNavigatorType } from "@components/Navigation"
import {} from "@lib/users"
import { StackScreenProps } from "@react-navigation/stack"
import { useRef } from "react"
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
  ) => Promise<"invalid-verification-code" | Password>
}

export type ForgotPasswordParamsList = {
  forgotPassword: { emailOrPhoneNumber: EmailAddress | USPhoneNumber }
  verifyCode: {
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  }
  resetPassword: { newPass: Password }
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
  ) => Promise<"invalid-verification-code" | Password>
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
  const generatedRef = useRef<Password | undefined>()
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
      navigation.navigate("resetPassword" as never)
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
    onSuccess: () => navigation.goBack()
  })
  return <ResetPasswordFormView {...resetPassword} />
}
