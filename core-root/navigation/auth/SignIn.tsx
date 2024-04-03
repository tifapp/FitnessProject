import { StackNavigatorType, XMarkBackButton } from "@components/Navigation"
import { StackScreenProps } from "@react-navigation/stack"
import React, { memo } from "react"
import {
  SignInFormView,
  useSignInForm,
  SignInAuthenticator
} from "@core-auth/sign-in"
import {
  EmailAddress,
  USPhoneNumber,
  AuthVerificationCodeFormView,
  useAuthVerificationCodeForm
} from "@core-auth"
import { SignUpParamsList } from "./SignUp"
import { ForgotPasswordParamsList } from "./ForgotPassword"

export type SignInParamsList = {
  signInForm: undefined
  signInVerifyCode: {
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  }
} & SignUpParamsList &
  ForgotPasswordParamsList

/**
 * Creates the screens required for sign in on a given stack navigator.
 *
 * @param stack a stack navigator.
 * @param authenticator see {@link SignInAuthenticator}.
 */
export const createSignInScreens = <Params extends SignInParamsList>(
  stack: StackNavigatorType<Params>,
  authenticator: SignInAuthenticator
) => (
  <>
    <stack.Screen
      name="signInForm"
      options={{ headerLeft: XMarkBackButton, title: "" }}
    >
      {(props: any) => (
        <SignInFormScreen {...props} authenticator={authenticator} />
      )}
    </stack.Screen>
    <stack.Screen
      name="signInVerifyCode"
      options={{ headerLeft: XMarkBackButton, title: "" }}
    >
      {(props: any) => (
        <SignInVerificationCodeScreen
          {...props}
          authenticator={authenticator}
        />
      )}
    </stack.Screen>
  </>
)

type SignInFormScreenProps = StackScreenProps<
  SignInParamsList,
  "signInForm"
> & {
  authenticator: SignInAuthenticator
}

const SignInFormScreen = memo(function Screen({
  navigation,
  authenticator
}: SignInFormScreenProps) {
  const form = useSignInForm({
    signIn: async (emailOrPhoneNumber, uncheckedPassword) => {
      return await authenticator.signIn(emailOrPhoneNumber, uncheckedPassword)
    },
    onSuccess: (result, emailOrPhoneNumber) => {
      if (result === "success") {
        navigation.getParent()?.goBack()
      } else if (result === "sign-up-verification-required") {
        navigation.replace("signUpVerifyCodeForm", { emailOrPhoneNumber })
      } else {
        navigation.replace("signInVerifyCode", { emailOrPhoneNumber })
      }
    }
  })
  return (
    <SignInFormView
      {...form}
      onForgotPasswordTapped={() => navigation.replace("forgotPassword")}
    />
  )
})

type SignInVerificationCodeScreenProps = StackScreenProps<
  SignInParamsList,
  "signInVerifyCode"
> & {
  authenticator: SignInAuthenticator
}

const SignInVerificationCodeScreen = memo(function Screen({
  navigation,
  route,
  authenticator
}: SignInVerificationCodeScreenProps) {
  const form = useAuthVerificationCodeForm({
    resendCode: async () => await authenticator.resendSignInVerificationCode(),
    submitCode: async (code) => {
      const result = await authenticator.verifySignIn(code)
      return { isCorrect: result === "success", data: undefined }
    },
    onSuccess: () => navigation.getParent()?.goBack()
  })
  return (
    <AuthVerificationCodeFormView
      {...form}
      codeReceiverName={route.params.emailOrPhoneNumber}
    />
  )
})
