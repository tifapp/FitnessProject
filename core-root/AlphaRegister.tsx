import { FormSubmissionPrimaryButton } from "@components/Buttons"
import { TiFFooterView } from "@components/Footer"
import { BodyText, Subtitle } from "@components/Text"
import { ShadedTextField } from "@components/TextFields"
import { TiFFormScrollableLayoutView } from "@components/form-components/ScrollableFormLayout"
import { AlertsObject, presentAlert } from "@lib/Alerts"
import { useFontScale } from "@lib/Fonts"
import { useFormSubmission } from "@lib/utils/Form"
import { useQueryClient } from "@tanstack/react-query"
import {
  IfAuthenticated,
  UserSession,
  setUserSessionQueryData
} from "@user/Session"
import { AlphaUser, alphaUserSession, registerAlphaUser } from "@user/alpha"
import { ReactNode, createContext, useContext, useState } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export const ALERTS = {
  failedToRegister: {
    title: "Failed to Register",
    description: "It seems we've failed to register you, please try again."
  }
} satisfies AlertsObject

export type AlphaRegisterContextValues = {
  register: (name: string) => Promise<AlphaUser>
}

const RegisterContext = createContext<AlphaRegisterContextValues>({
  register: registerAlphaUser
})

export type AlphaRegisterProviderProps = AlphaRegisterContextValues & {
  children: ReactNode
}

export const AlphaRegisterProvider = ({
  children,
  ...values
}: AlphaRegisterProviderProps) => (
  <RegisterContext.Provider value={values}>{children}</RegisterContext.Provider>
)

export const useAlphaRegister = () => {
  const [name, setName] = useState("")
  const queryClient = useQueryClient()
  const { register } = useContext(RegisterContext)
  return {
    name,
    nameChanged: setName,
    submission: useFormSubmission(
      async (name: string) => await register(name),
      () => {
        if (name.length === 0) return { status: "invalid" }
        return { status: "submittable", submissionValues: name }
      },
      {
        onSuccess: (user) => {
          setUserSessionQueryData(queryClient, alphaUserSession(user))
        },
        onError: () => {
          presentAlert(ALERTS.failedToRegister)
        }
      }
    )
  }
}

export type AlphaRegisterProps = {
  state: ReturnType<typeof useAlphaRegister>
  style?: StyleProp<ViewStyle>
}

export const AlphaRegisterView = ({ state, style }: AlphaRegisterProps) => (
  <View style={style}>
    <TiFFormScrollableLayoutView
      footer={
        <TiFFooterView>
          <FormSubmissionPrimaryButton
            submission={state.submission}
            style={styles.button}
          >
            Register
          </FormSubmissionPrimaryButton>
        </TiFFooterView>
      }
      style={styles.layout}
    >
      <View style={styles.text}>
        <Subtitle>Register</Subtitle>
        <BodyText>Enter your name.</BodyText>
      </View>
      <ShadedTextField
        placeholder="Enter a Name"
        value={state.name}
        onChangeText={state.nameChanged}
        textStyle={{ height: 32 * useFontScale() }}
      />
    </TiFFormScrollableLayoutView>
  </View>
)

/**
 * Ensures that a component renders with a user session based on data from an {@link AlphaUser}.
 *
 * If the user is not authenticated, the {@link AlphaRegisterView} is presented instead.
 */
export const withAlphaRegistration = <Props,>(
  Component: (props: Props & { session: UserSession }) => ReactNode
) => {
  // eslint-disable-next-line react/display-name
  return (props: Props) => (
    <IfAuthenticated
      thenRender={(session) => <Component {...props} session={session} />}
      elseRender={
        <AlphaRegisterView state={useAlphaRegister()} style={styles.register} />
      }
    />
  )
}

const styles = StyleSheet.create({
  text: {
    rowGap: 8
  },
  button: {
    width: "100%"
  },
  layout: {
    flex: 1
  },
  register: {
    flex: 1
  }
})
