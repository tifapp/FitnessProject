import { StackNavigatorType, XMarkBackButton } from "@components/Navigation"
import { SignInAuthenticator } from "./Authenticator"
import { StackScreenProps } from "@react-navigation/stack"
import React, { memo } from "react"
import { SignInFormView, useSignInForm } from "./SignInForm"
import { EmailAddress, USPhoneNumber } from ".."
import {
  AuthVerificationCodeFormView,
  useAuthVerificationCodeForm
} from "@auth/VerifyCode"
import { SignUpParamsList } from "@auth/sign-up"

export type SignInParamsList = {
  signInForm: undefined
  signInVerifyCode: {
    emailOrPhoneNumber: EmailAddress | USPhoneNumber
  }
} & SignUpParamsList

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

// const SignInModalStack = createStackNavigator<SignInModalParamsList>()

// type SignInModalScreenProps = StackScreenProps<SignInParamsList, "signIn"> & {
//   authenticator: SignInAuthenticator
// }

// const SignInModalScreen = memo(function Screen ({
//   authenticator
// }: SignInModalScreenProps) {
//   return (
//     <SignInModalStack.Navigator
//       screenOptions={BASE_HEADER_SCREEN_OPTIONS}
//       initialRouteName="signInForm"
//     >
//       <SignInModalStack.Screen
//         name="signInForm"
//         options={{ headerLeft: XMarkBackButton, title: "" }}
//       >
//         {(props) => (
//           <SignInFormScreen {...props} authenticator={authenticator} />
//         )}
//       </SignInModalStack.Screen>
//       <SignInModalStack.Screen
//         name="signInVerifyCode"
//         options={{ headerLeft: XMarkBackButton, title: "" }}
//       >
//         {(props) => (
//           <SignInVerificationCodeScreen
//             {...props}
//             authenticator={authenticator}
//           />
//         )}
//       </SignInModalStack.Screen>
//     </SignInModalStack.Navigator>
//   )
// })

type SignInFormScreenProps = StackScreenProps<
  SignInParamsList,
  "signInForm"
> & {
  authenticator: SignInAuthenticator
}

const SignInFormScreen = memo(function Screen ({
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
        navigation.navigate("signInVerifyCode", { emailOrPhoneNumber })
      }
    }
  })
  return <SignInFormView {...form} onForgotPasswordTapped={() => {}} />
})

type SignInVerificationCodeScreenProps = StackScreenProps<
  SignInParamsList,
  "signInVerifyCode"
> & {
  authenticator: SignInAuthenticator
}

const SignInVerificationCodeScreen = memo(function Screen ({
  navigation,
  route,
  authenticator
}: SignInVerificationCodeScreenProps) {
  const form = useAuthVerificationCodeForm({
    resendCode: async () => await authenticator.resendSignInVerificationCode(),
    submitCode: async (code) => {
      const result = await authenticator.verifySignIn(code)
      return result === "success"
    },
    onSuccess: () => navigation.getParent()?.goBack()
  })
  return (
    <AuthVerificationCodeFormView
      {...form}
      codeReceiverName={route.params.emailOrPhoneNumber.formattedForPrivacy}
    />
  )
})
