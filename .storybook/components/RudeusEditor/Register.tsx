import { PrimaryButton } from "@components/Buttons"
import { TiFFooterView } from "@components/Footer"
import { BodyText, Subtitle } from "@components/Text"
import { ShadedTextField } from "@components/TextFields"
import { TiFFormScrollableLayoutView } from "@components/form-components/ScrollableFormLayout"
import { AlertsObject, presentAlert } from "@lib/Alerts"
import { useFontScale } from "@lib/Fonts"
import { useFormSubmission } from "@lib/utils/Form"
import { useState } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { RudeusUser } from "./Models"
import { RudeusAPI } from "./RudeusAPI"
import { RudeusUserStorage } from "./UserStorage"

export const registerUser = async (
  name: string,
  api: RudeusAPI,
  tokenStorage: RudeusUserStorage
) => {
  const resp = await api.register({ body: { name } })
  await tokenStorage.saveToken(resp.data.token)
  return resp.data
}

export const ALERTS = {
  failedToRegister: {
    title: "Failed to Register",
    description: "It seems we've failed to register you, please try again."
  }
} satisfies AlertsObject

export type UseRudeusRegisterEnvironment = {
  register: (name: string) => Promise<RudeusUser>
  onSuccess: (user: RudeusUser) => void
}

export const useRudeusRegister = ({
  register,
  onSuccess
}: UseRudeusRegisterEnvironment) => {
  const [name, setName] = useState("")
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
        onSuccess: (user) => onSuccess(user),
        onError: () => {
          presentAlert(ALERTS.failedToRegister)
        }
      }
    )
  }
}

export type RudeusRegisterProps = {
  state: ReturnType<typeof useRudeusRegister>
  style?: StyleProp<ViewStyle>
}

export const RudeusRegisterView = ({ state, style }: RudeusRegisterProps) => (
  <View style={style}>
    <TiFFormScrollableLayoutView
      footer={
        <TiFFooterView>
          <PrimaryButton
            disabled={state.submission.status !== "submittable"}
            onPress={() => {
              if (state.submission.status === "submittable") {
                state.submission.submit()
              }
            }}
            style={styles.button}
          >
            Register
          </PrimaryButton>
        </TiFFooterView>
      }
      style={styles.layout}
    >
      <View style={styles.text}>
        <Subtitle>Register</Subtitle>
        <BodyText>
          Your name will be used for sharing haptic patterns and other cutscene
          content.
        </BodyText>
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
