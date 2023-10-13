import React, { memo, useRef } from "react"
import {
  BASE_HEADER_SCREEN_OPTIONS,
  ChevronBackButton,
  StackNavigatorType,
  XMarkBackButton
} from "@components/Navigation"
import { EmailAddress, USPhoneNumber } from ".."
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
import { NavigatorScreenParams, useNavigation } from "@react-navigation/native"
import {
  useAuthVerificationCodeForm,
  AuthVerificationCodeFormView
} from "@auth/VerifyCode"
import { SignUpEnvironment } from "./Environment"
import { TouchableIonicon } from "@components/common/Icons"
import { Alert, StyleSheet } from "react-native"

export type SignUpModalParamsList = {
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
      {(props: StackScreenProps<SignUpParamsList, "signUp">) => (
        <SignUpModalScreen {...props} {...env} />
      )}
    </stack.Screen>
  )
}

type SignUpModalScreenProps = StackScreenProps<SignUpParamsList, "signUp"> &
  SignUpEnvironment

const SignUpModalScreen = memo(function Screen ({
  createAccount,
  finishRegisteringAccount,
  resendVerificationCode,
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
          headerLeft: SignUpExitButton,
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
            resendVerificationCode={resendVerificationCode}
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
  SignUpModalParamsList,
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
      iOSInModal
      codeReceiverName={route.params.emailOrPhoneNumber.formattedForPrivacy}
    />
  )
})

type ChangeUserHandleFormScreenProps = StackScreenProps<
  SignUpModalParamsList,
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
}: StackScreenProps<SignUpModalParamsList, "signUpEnding">) => (
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
