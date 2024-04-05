import {
  ChangePasswordFormView,
  ChangePasswordResult,
  useChangePasswordForm
} from "@event-details-boundary/ChangePassword"
import { EmailAddress } from "@event-details-boundary/Email"
import {
  AuthVerificationCodeFormView,
  useAuthVerificationCodeForm
} from "@event-details-boundary/VerifyCode"
import {
  ForgotPasswordFormView,
  useForgotPasswordForm
} from "@event-details-boundary/forgot-password/ForgotPasswordForm"
import {
  ResetPasswordFormView,
  ResetPasswordResult,
  useResetPasswordForm
} from "@event-details-boundary/forgot-password/ResetPasswordForm"
import { StackNavigatorType } from "@components/Navigation"
import { delayData } from "@lib/utils/DelayData"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { ActivitiesStackParamList } from "@stacks/ActivitiesStack"
import React from "react"

export type SignInScreensParamsList = {
  ChangePasswordScreen: undefined
  ForgotPasswordScreen: undefined
  ResetPasswordScreen: undefined
  VerifyCodeScreen: undefined
}

export type ChangePasswordScreenProps = StackScreenProps<
  SignInScreensParamsList,
  "ChangePasswordScreen"
>

export type ForgotPasswordScreenProps = StackScreenProps<
  SignInScreensParamsList,
  "ForgotPasswordScreen"
>

export type ResetPasswordScreenProps = StackScreenProps<
  SignInScreensParamsList,
  "ResetPasswordScreen"
>

export type VerifyCodeScreenProps = StackScreenProps<
  SignInScreensParamsList,
  "VerifyCodeScreen"
>

export const createSignInStackScreens = <T extends SignInScreensParamsList>(
  SignInStack: StackNavigatorType<T>
) => {
  return (
    <>
      <SignInStack.Screen
        name={"ChangePasswordScreen"}
        component={ChangePasswordScreen}
      />

      <SignInStack.Screen
        name={"ForgotPasswordScreen"}
        component={ForgotPasswordScreen}
      />

      <SignInStack.Screen
        name={"ResetPasswordScreen"}
        component={ResetPasswordScreen}
      />

      <SignInStack.Screen
        name={"VerifyCodeScreen"}
        component={VerifyCodeScreen}
      />
    </>
  )
}

const ChangePasswordScreen = ({ navigation }: ChangePasswordScreenProps) => {
  const changePassword = useChangePasswordForm({
    changePassword: async () => await delayData<ChangePasswordResult>("valid"),
    onSuccess: () => navigation.goBack()
  })

  return (
    <ChangePasswordFormView
      {...changePassword}
      onForgotPasswordTapped={() => console.log("Forgot password")}
    />
  )
}

const ForgotPasswordScreen = ({ navigation }) => {
  const forgotPassword = useForgotPasswordForm({
    initiateForgotPassword: async () =>
      await delayData<void>(console.log("Test Forgot Password Screen")),
    onSuccess: () => navigation.navigate("VerifyCodeScreen")
  })
  return <ForgotPasswordFormView {...forgotPassword} />
}

const VerifyCodeScreen = ({ navigation }) => {
  const email = EmailAddress.parse("peacock69@gmail.com")!
  const form = useAuthVerificationCodeForm({
    submitCode: async () => await delayData(false, 7000),
    resendCode: async () => await delayData(undefined, 1000),
    onSuccess: () => navigation.navigate("ResetPasswordScreen")
  })
  console.log("Code resend status", form.resendCodeStatus)
  return (
    <AuthVerificationCodeFormView
      {...form}
      codeReceiverName={email.formattedForPrivacy}
    />
  )
}

const ResetPasswordScreen = ({ navigation }: ResetPasswordScreenProps) => {
  const resetPassword = useResetPasswordForm({
    submitResettedPassword: async () =>
      await delayData<ResetPasswordResult>("valid"),
    onSuccess: () => navigation.goBack()
  })
  return <ResetPasswordFormView {...resetPassword} />
}

/**
 * Navigation Stack for Profile Screens for use in the Tab Navigator (so headers render)
 */
export const SignInStack = () => {
  const SignInStack = createStackNavigator<ActivitiesStackParamList>()
  const signInScreens =
    createSignInStackScreens<ActivitiesStackParamList>(SignInStack)

  return (
    <SignInStack.Navigator initialRouteName={"ForgotPasswordScreen"}>
      {signInScreens}
    </SignInStack.Navigator>
  )
}
