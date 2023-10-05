import React, { memo, useRef } from "react"
import {
  BASE_HEADER_SCREEN_OPTIONS,
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
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import {
  SignUpCredentialsFormView,
  useSignUpCredentialsForm
} from "./CredentialsForm"
import {
  SignUpChangeUserHandleFormView,
  useSignUpChangeUserHandleForm
} from "./ChangeUserHandle"
import { SignUpEndingView } from "./Ending"
import { NavigatorScreenParams } from "@react-navigation/native"

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
  resendCode: () => Promise<void>
  finishRegisteringAccount: (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    verificationCode: string
  ) => Promise<"invalid-verification-code" | UserHandle>
}

type SignUpModalParamsList = {
  signUpCredentialsForm: undefined
  signUpVerifyCodeForm: {
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  }
  signUpChangeUserHandleForm: {
    initialHandle: UserHandle
  }
  signUpEnding: undefined
}

export type SignUpParamsList = {
  signUp: NavigatorScreenParams<SignUpModalParamsList>
}

const SignUpModalStack = createStackNavigator<SignUpModalParamsList>()

/**
 * Creates the sign up screens on a Stack Navigator.
 */
export const createSignUpScreens = <Params extends SignUpParamsList>(
  stack: StackNavigatorType<Params>,
  env: SignUpEnvironment
) => {
  return (
    <stack.Screen
      name="signUp"
      options={() => ({ headerShown: false, presentation: "modal" })}
    >
      {(props: any) => <SignUpModalScreen {...props} {...env} />}
    </stack.Screen>
  )
}

type SignUpModalScreenProps = StackScreenProps<SignUpParamsList, "signUp"> &
  SignUpEnvironment

const SignUpModalScreen = memo(function Screen ({
  createAccount,
  finishRegisteringAccount,
  resendCode,
  changeUserHandle,
  checkIfUserHandleTaken
}: SignUpModalScreenProps) {
  return (
    <SignUpModalStack.Navigator
      screenOptions={BASE_HEADER_SCREEN_OPTIONS}
      initialRouteName="signUpCredentialsForm"
    >
      <SignUpModalStack.Screen
        name="signUpCredentialsForm"
        options={() => ({
          headerLeft: XMarkBackButton,
          title: ""
        })}
      >
        {(props) => (
          <CredentialsFormScreen {...props} createAccount={createAccount} />
        )}
      </SignUpModalStack.Screen>
      <SignUpModalStack.Screen
        name="signUpVerifyCodeForm"
        options={() => ({
          headerLeft: XMarkBackButton,
          title: ""
        })}
      >
        {(props) => (
          <VerifyCodeFormScreen
            {...props}
            resendCode={resendCode}
            finishRegisteringAccount={finishRegisteringAccount}
          />
        )}
      </SignUpModalStack.Screen>
      <SignUpModalStack.Screen
        name="signUpChangeUserHandleForm"
        options={() => ({ headerLeft: XMarkBackButton, title: "" })}
      >
        {(props) => (
          <ChangeUserHandleFormScreen
            {...props}
            changeUserHandle={changeUserHandle}
            checkIfUserHandleTaken={checkIfUserHandleTaken}
          />
        )}
      </SignUpModalStack.Screen>
      <SignUpModalStack.Screen
        name="signUpEnding"
        options={() => ({ headerLeft: ChevronBackButton, title: "" })}
        component={EndingScreen}
      />
    </SignUpModalStack.Navigator>
  )
})

type CredentialsScreenProps = StackScreenProps<
  SignUpModalParamsList,
  "signUpCredentialsForm"
> & {
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
      navigation.replace("signUpVerifyCodeForm", { emailOrPhoneNumber })
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

type VerifyCodeFormScreenProps = StackScreenProps<
  SignUpModalParamsList,
  "signUpVerifyCodeForm"
> & {
  finishRegisteringAccount: (
    emailOrPhoneNumber: EmailAddress | USPhoneNumber,
    verificationCode: string
  ) => Promise<"invalid-verification-code" | UserHandle>
  resendCode: () => Promise<void>
}

const VerifyCodeFormScreen = memo(function Screen ({
  navigation,
  route,
  finishRegisteringAccount,
  resendCode
}: VerifyCodeFormScreenProps) {
  const generatedUserHandleRef = useRef<UserHandle | undefined>()
  const form = useAuthVerificationCodeForm({
    resendCode,
    submitCode: async (code: string) => {
      const result = await finishRegisteringAccount(
        route.params.emailOrPhoneNumber,
        code
      )
      if (result === "invalid-verification-code") {
        return false
      }
      generatedUserHandleRef.current = result
      return true
    },
    onSuccess: () => {
      if (generatedUserHandleRef.current) {
        navigation.replace("signUpChangeUserHandleForm", {
          initialHandle: generatedUserHandleRef.current
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
})

type ChangeUserHandleFormScreenProps = StackScreenProps<
  SignUpModalParamsList,
  "signUpChangeUserHandleForm"
> & {
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
    onSuccess: () => navigation.navigate("signUpEnding")
  })
  return <SignUpChangeUserHandleFormView {...form} />
})

const EndingScreen = ({
  navigation
}: StackScreenProps<SignUpModalParamsList, "signUpEnding">) => (
  <SignUpEndingView
    onCallToActionTapped={() => navigation.getParent()?.goBack()}
  />
)
