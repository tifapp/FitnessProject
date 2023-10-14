import React, { memo, useRef } from "react"
import {
  ChevronBackButton,
  StackNavigatorType,
  XMarkBackButton
} from "@components/Navigation"
import { EmailAddress, USPhoneNumber } from ".."
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
import { useNavigation } from "@react-navigation/native"
import {
  useAuthVerificationCodeForm,
  AuthVerificationCodeFormView
} from "@auth/VerifyCode"
import { SignUpEnvironment } from "./Environment"
import { TouchableIonicon } from "@components/common/Icons"
import { Alert, StyleSheet } from "react-native"

export type SignUpParamsList = {
  signUpCredentialsForm: undefined
  signUpVerifyCodeForm: {
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  }
  signUpChangeUserHandleForm: {
    initialHandle: UserHandle
  }
  signUpEnding: undefined
}
/**
 * Creates the sign up screens on a Stack Navigator.
 */
export const createSignUpScreens = <Params extends SignUpParamsList>(
  stack: StackNavigatorType<Params>,
  {
    createAccount,
    finishRegisteringAccount,
    resendVerificationCode,
    changeUserHandle,
    checkIfUserHandleTaken
  }: SignUpEnvironment
) => {
  return (
    <>
      <stack.Screen
        name="signUpCredentialsForm"
        options={() => ({
          headerLeft: SignUpExitButton,
          title: ""
        })}
      >
        {(props: any) => (
          <CredentialsFormScreen {...props} createAccount={createAccount} />
        )}
      </stack.Screen>
      <stack.Screen
        name="signUpVerifyCodeForm"
        options={() => ({
          headerLeft: XMarkBackButton,
          title: ""
        })}
      >
        {(props: any) => (
          <VerifyCodeFormScreen
            {...props}
            resendVerificationCode={resendVerificationCode}
            finishRegisteringAccount={finishRegisteringAccount}
          />
        )}
      </stack.Screen>
      <stack.Screen
        name="signUpChangeUserHandleForm"
        options={() => ({ headerLeft: XMarkBackButton, title: "" })}
      >
        {(props: any) => (
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

type CredentialsScreenProps = StackScreenProps<
  SignUpParamsList,
  "signUpCredentialsForm"
> &
  Pick<SignUpEnvironment, "createAccount">

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
  SignUpParamsList,
  "signUpVerifyCodeForm"
> &
  Pick<SignUpEnvironment, "finishRegisteringAccount" | "resendVerificationCode">

const VerifyCodeFormScreen = memo(function Screen ({
  navigation,
  route,
  finishRegisteringAccount,
  resendVerificationCode
}: VerifyCodeFormScreenProps) {
  const generatedUserHandleRef = useRef<UserHandle | undefined>()
  const form = useAuthVerificationCodeForm({
    resendCode: async () =>
      await resendVerificationCode(route.params.emailOrPhoneNumber),
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
      codeReceiverName={route.params.emailOrPhoneNumber.formattedForPrivacy}
    />
  )
})

type ChangeUserHandleFormScreenProps = StackScreenProps<
  SignUpParamsList,
  "signUpChangeUserHandleForm"
> &
  Pick<SignUpEnvironment, "checkIfUserHandleTaken" | "changeUserHandle">

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
}: StackScreenProps<SignUpParamsList, "signUpEnding">) => (
  <SignUpEndingView
    onCallToActionTapped={() => navigation.getParent()?.goBack()}
  />
)

const SignUpExitButton = () => {
  const navigation = useNavigation()
  return (
    <TouchableIonicon
      icon={{ name: "close" }}
      accessibilityLabel="Go Back"
      onPress={() => {
        Alert.alert(
          "Cancel Sign Up?",
          "Are you sure you want to cancel your sign-up?",
          [
            {
              text: "Cancel Sign Up",
              style: "destructive",
              onPress: () => navigation.getParent()?.goBack()
            },
            { text: "Dismiss" }
          ]
        )
      }}
      style={styles.exitButtonPadding}
    />
  )
}

const styles = StyleSheet.create({
  exitButtonPadding: {
    paddingLeft: 16
  }
})
