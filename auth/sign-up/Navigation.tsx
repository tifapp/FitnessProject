import React, { memo, useRef } from "react"
import {
  ChevronBackButton,
  StackNavigatorType,
  XMarkBackButton
} from "@components/Navigation"
import {
  AuthVerificationCodeFormView,
  EmailAddress,
  USPhoneNumber,
  useAuthVerificationCodeForm
} from ".."
import { UserHandle } from "@lib/users"
import { StackScreenProps } from "@react-navigation/stack"
import {
  SignUpCredentialsFormView,
  useSignUpCredentialsForm
} from "./CredentialsForm"
import {
  SignUpChangeUserHandleFormView,
  useSignUpChangeUserHandleForm
} from "./ChangeUserHandle"
import { SignUpEndingView } from "./Ending"

export type SignUpEnvironment = {
  createAccount: (
    name: string,
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    uncheckedPassword: string
  ) => Promise<void>
  checkIfUserHandleTaken: (
    handle: UserHandle,
    signal?: AbortSignal
  ) => Promise<boolean>
  changeUserHandle: (handle: UserHandle) => Promise<void>
  finishRegisteringAccount: (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    verificationCode: string
  ) => Promise<{ userHandle: UserHandle }>
}

export type SignUpParamsList = {
  signUpCredentialsForm: {}
  signUpVerifyCodeForm: {
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  }
  signUpChangeUserHandleForm: {
    initialHandle: UserHandle
  }
  signUpEnding: {}
}

type CredentialsFormStackScreenProps = StackScreenProps<
  SignUpParamsList,
  "signUpCredentialsForm"
>

type VerifyCodeFormStackScreenPrrops = StackScreenProps<
  SignUpParamsList,
  "signUpVerifyCodeForm"
>

type ChangeUserHandleFormStackScreenProps = StackScreenProps<
  SignUpParamsList,
  "signUpChangeUserHandleForm"
>

export const createSignUpScreens = <Params extends SignUpParamsList>(
  stack: StackNavigatorType<Params>,
  {
    createAccount,
    finishRegisteringAccount,
    changeUserHandle,
    checkIfUserHandleTaken
  }: SignUpEnvironment
) => {
  return (
    <>
      <stack.Screen
        name="signUpCredentialsForm"
        options={() => ({ headerLeft: XMarkBackButton, title: "" })}
      >
        {(props: CredentialsFormStackScreenProps) => (
          <CredentialsFormScreen {...props} createAccount={createAccount} />
        )}
      </stack.Screen>
      <stack.Screen
        name="signUpVerifyCodeForm"
        options={() => ({ headerLeft: ChevronBackButton, title: "" })}
      >
        {(props: VerifyCodeFormStackScreenPrrops) => (
          <VerifyCodeFormScreen
            {...props}
            finishRegisteringAccount={finishRegisteringAccount}
          />
        )}
      </stack.Screen>
      <stack.Screen
        name="signUpChangeUserHandleForm"
        options={() => ({ headerLeft: ChevronBackButton, title: "" })}
      >
        {(props: ChangeUserHandleFormStackScreenProps) => (
          <ChangeUserHandleFormScreen
            {...props}
            changeUserHandle={changeUserHandle}
            checkIfUserHandleTaken={checkIfUserHandleTaken}
          />
        )}
      </stack.Screen>
      <stack.Screen
        name="signUpEnding"
        options={() => ({ headerLeft: ChevronBackButton, title: "" })}
        component={EndingScreen}
      />
    </>
  )
}

type CredentialsScreenProps = CredentialsFormStackScreenProps & {
  createAccount: (
    name: string,
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    uncheckedPassword: string
  ) => Promise<void>
}

const CredentialsFormScreen = memo(function Screen ({
  navigation,
  createAccount
}: CredentialsScreenProps) {
  const form = useSignUpCredentialsForm({
    createAccount,
    onSuccess: (emailOrPhoneNumber) => {
      console.log("Navigating")
      navigation.navigate("signUpVerifyCodeForm", { emailOrPhoneNumber })
    }
  })
  return (
    <SignUpCredentialsFormView
      {...form}
      onPrivacyPolicyTapped={() => {}}
      onTermsAndConditionsTapped={() => {}}
    />
  )
})

type VerifyCodeFormScreenProps = VerifyCodeFormStackScreenPrrops & {
  finishRegisteringAccount: (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    verificationCode: string
  ) => Promise<{ userHandle: UserHandle }>
}

const VerifyCodeFormScreen = memo(function Screen ({
  navigation,
  route,
  finishRegisteringAccount
}: VerifyCodeFormScreenProps) {
  console.log("Verify Code Screen")
  const generatedUserHandleRef = useRef<UserHandle | undefined>()
  const form = useAuthVerificationCodeForm({
    resendCode: async () => {},
    checkCode: async (code: string) => {
      generatedUserHandleRef.current = await finishRegisteringAccount(
        route.params.emailOrPhoneNumber,
        code
      ).then((res) => res.userHandle)
      return true
    },
    onSuccess: () => {
      if (generatedUserHandleRef.current) {
        navigation.navigate("signUpChangeUserHandleForm", {
          initialHandle: generatedUserHandleRef.current
        })
      }
    }
  })
  return (
    <AuthVerificationCodeFormView
      {...form}
      codeReceiverName={route.params.emailOrPhoneNumber.formattedForPrivacy}
    />
  )
})

type ChangeUserHandleFormScreenProps = ChangeUserHandleFormStackScreenProps & {
  checkIfUserHandleTaken: (
    handle: UserHandle,
    signal?: AbortSignal
  ) => Promise<boolean>
  changeUserHandle: (handle: UserHandle) => Promise<void>
}

const ChangeUserHandleFormScreen = memo(function Screen ({
  navigation,
  route,
  checkIfUserHandleTaken,
  changeUserHandle
}: ChangeUserHandleFormScreenProps) {
  const form = useSignUpChangeUserHandleForm(route.params.initialHandle, 300, {
    checkIfUserHandleTaken,
    changeUserHandle,
    onSuccess: () => navigation.navigate("signUpEnding", {})
  })
  return <SignUpChangeUserHandleFormView {...form} />
})

const EndingScreen = ({
  navigation
}: StackScreenProps<SignUpParamsList, "signUpEnding">) => (
  <SignUpEndingView onCallToActionTapped={navigation.popToTop} />
)
