import { StackNavigatorType } from "@components/Navigation"
import { delayData } from "@lib/DelayData"
import { UserHandle } from "@lib/users"
import { StackScreenProps } from "@react-navigation/stack"
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
  finishRegisteringAccount: (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    verificationCode: string
  ) => Promise<"invalid-verification-code" | UserHandle>
}

export type ForgotPasswordParamsList = {
  forgotPassword: ForgotPasswordScreenProps
  verifyCode: VerifyCodeScreenProps
  resetPassword: ResetPasswordScreenProps
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
  finishRegisteringAccount: (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    verificationCode: string
  ) => Promise<"invalid-verification-code" | UserHandle>
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
      <stack.Screen name="forgotPassword" component={ForgotPasswordScreen} />
      <stack.Screen name="verifyCode" component={VerifyCodeScreen} />
      <stack.Screen name="resetPassword" component={ResetPasswordScreen} />
    </>
  )
}

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
  const forgotPassword = useForgotPasswordForm({
    initiateForgotPassword: async () =>
      await delayData<void>(console.log("Test Forgot Password Screen")),
    onSuccess: () => navigation.navigate("verifyCode" as never)
  })
  return <ForgotPasswordFormView {...forgotPassword} />
}

const VerifyCodeScreen = ({ route, navigation }: VerifyCodeScreenProps) => {
  const phone = USPhoneNumber.parse("8883331778")!
  const form = useAuthVerificationCodeForm({
    submitCode: async () => await delayData(false, 7000),
    resendCode: async () => {},
    onSuccess: () => navigation.navigate("resetPassword" as never)
  })
  // console.log("Code resend status", form.resendCodeStatus)
  return (
    <AuthVerificationCodeFormView
      {...form}
      codeReceiverName={phone.formattedForPrivacy}
    />
  )
}

const ResetPasswordScreen = ({ navigation }: ResetPasswordScreenProps) => {
  const resetPassword = useResetPasswordForm({
    initiateResetPassword: async () =>
      await delayData<ResetPasswordResult>("valid"),
    onSuccess: () => navigation.goBack()
  })
  return <ResetPasswordFormView {...resetPassword} />
}
