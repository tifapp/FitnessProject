import { FormSubmissionPrimaryButton } from "@components/Buttons"
import { TiFFooterView } from "@components/Footer"
import { BodyText, Subtitle } from "@components/Text"
import { ShadedTextField } from "@components/TextFields"
import { TiFFormScrollableLayoutView } from "@components/form-components/ScrollableFormLayout"
import { AlertsObject, presentAlert } from "@lib/Alerts"
import { useFontScale } from "@lib/Fonts"
import { useFormSubmission } from "@lib/utils/Form"
import { useQueryClient } from "@tanstack/react-query"
import { setUserSessionQueryData } from "@user/Session"
import { AlphaUser, alphaUserSession } from "@user/alpha"
import { useState } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export const ALERTS = {
  failedToRegister: {
    title: "Failed to Register",
    description: "It seems we've failed to register you, please try again."
  }
} satisfies AlertsObject

export type UseAlphaRegisterEnvironment = {
  register: (name: string) => Promise<AlphaUser>
  onSuccess: (user: AlphaUser) => void
}

export const useAlphaRegister = ({
  register,
  onSuccess
}: UseAlphaRegisterEnvironment) => {
  const [name, setName] = useState("")
  const queryClient = useQueryClient()
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
          onSuccess(user)
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

const styles = StyleSheet.create({
  text: {
    rowGap: 8
  },
  button: {
    width: "100%"
  },
  layout: {
    flex: 1
  }
})
