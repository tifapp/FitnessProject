import { FormSubmissionPrimaryButton } from "@components/Buttons"
import { TiFFooterView } from "@components/Footer"
import { BodyText, Subtitle } from "@components/Text"
import { ShadedTextField } from "@components/TextFields"
import { TiFFormScrollableLayoutView } from "@components/form-components/ScrollableFormLayout"
import { AlertsObject, presentAlert } from "@lib/Alerts"
import { featureContext } from "@lib/FeatureContext"
import { useFontScale } from "@lib/Fonts"
import { useFormSubmission } from "@lib/utils/Form"
import { useQueryClient } from "@tanstack/react-query"
import {
  IfAuthenticated,
  UserSession,
  setUserSessionQueryData
} from "@user/Session"
import { alphaUserSession, registerAlphaUser } from "@user/alpha"
import { ReactNode, useState } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export const ALERTS = {
  failedToRegister: {
    title: "Failed to Register",
    description: "It seems we've failed to register you, please try again."
  }
} satisfies AlertsObject

export const AlphaRegisterFeature = featureContext({
  register: registerAlphaUser
})

export const useAlphaRegister = () => {
  const [name, setName] = useState("")
  const queryClient = useQueryClient()
  const { register } = AlphaRegisterFeature.useContext()
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

export type WithAlphaRegistrationProps<Props> = Props & { session: UserSession }

/**
 * Ensures that a component renders with a user session based on data from an {@link AlphaUser}.
 *
 * If the user is not authenticated, the {@link AlphaRegisterView} is presented instead.
 */
// eslint-disable-next-line comma-spacing
export const withAlphaRegistration = <Props,>(
  Component: (props: WithAlphaRegistrationProps<Props>) => ReactNode
) => {
  // eslint-disable-next-line react/display-name
  return (props: Props) => (
    <IfAuthenticated
      thenRender={(session) => <Component {...props} session={session} />}
      elseRender={
        <SafeAreaView style={styles.register}>
          <AlphaRegisterView
            state={useAlphaRegister()}
            style={styles.register}
          />
        </SafeAreaView>
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
