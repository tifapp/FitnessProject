import {
  ChevronBackButton,
  StackNavigatorType,
  XMarkBackButton
} from "@components/Navigation"
import { StackScreenProps } from "@react-navigation/stack"
import { Alert } from "react-native"
import {
  AuthVerificationCodeFormView,
  EmailAddress,
  Password,
  USPhoneNumber,
  useAuthVerificationCodeForm
} from "@core-auth"
import {
  ForgotPasswordEnvironment,
  ForgotPasswordFormView,
  useForgotPasswordForm,
  ResetPasswordFormView,
  useResetPasswordForm
} from "@core-auth/forgot-password"
import React from "react"

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
  Pick<ForgotPasswordEnvironment, "resendForgotPasswordCode">

type ResetPasswordScreenProps = StackScreenProps<
  ForgotPasswordParamsList,
  "resetPassword"
> &
  Pick<ForgotPasswordEnvironment, "submitResettedPassword">

/**
 * Creates screens required for Forgot password on a stack navigator.
 *
 * @param stack a stack navigator.
 * @param env see {@link ForgotPasswordEnvironment}
 */
export const createForgotPasswordScreens = <T extends ForgotPasswordParamsList>(
  stack: StackNavigatorType<T>,
  env: ForgotPasswordEnvironment
) => {
  return (
    <>
      <stack.Screen
        name="forgotPassword"
        options={() => ({
          headerLeft: XMarkBackButton,
          title: ""
        })}
      >
        {(props: any) => (
          <ForgotPasswordScreen
            {...props}
            initiateForgotPassword={env.initiateForgotPassword}
          />
        )}
      </stack.Screen>

      <stack.Screen
        name="verifyCode"
        options={() => ({
          headerLeft: XMarkBackButton,
          title: ""
        })}
      >
        {(props: any) => (
          <VerifyCodeScreen
            {...props}
            resendForgotPasswordCode={env.resendForgotPasswordCode}
          />
        )}
      </stack.Screen>

      <stack.Screen
        name="resetPassword"
        options={() => ({
          headerLeft: ChevronBackButton,
          title: ""
        })}
      >
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

const VerifyCodeScreen = ({
  navigation,
  route,
  resendForgotPasswordCode
}: VerifyCodeScreenProps) => {
  const form = useAuthVerificationCodeForm({
    resendCode: async () => {
      await resendForgotPasswordCode(route.params.emailOrPhoneNumber)
    },
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
      codeReceiverName={route.params.emailOrPhoneNumber}
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
        navigation.navigate("verifyCode", {
          emailOrPhoneNumber: route.params.emailOrPhoneNumber,
          code: route.params.code,
          newPass
        })
      }
    }
  })
  return <ResetPasswordFormView {...resetPassword} />
}
