import { useMutation } from "@tanstack/react-query"
import { PrivacyFormattable } from "@user/privacy"
import { StyleProp, View, ViewStyle, Alert, AlertButton } from "react-native"

export const ALERTS = {
  signOutConfirmation: {
    title: "Sign Out",
    description: "Are your sure about signing out of your account?",
    buttons: (signOut: () => void) => {
      return [
        { text: "Cancel" },
        { text: "Sign Out", style: "destructive" as const, onPress: signOut }
      ]
    }
  },
  signOutError: {
    title: "An Error Occurred",
    description:
      "We were unable to sign you out of your account, we apologize for the inconvenience. Please try again later."
  }
}

const presentAlert = <Key extends keyof typeof ALERTS>(
  kind: Key,
  actions?: AlertButton[]
) => {
  Alert.alert(ALERTS[kind].title, ALERTS[kind].description, actions)
}

export type UseAccountInfoSettingsEnvironment = {
  signOut: () => Promise<void>
  onSignOutSuccess: () => void
}

export const useAccountInfoSettings = ({
  signOut,
  onSignOutSuccess
}: UseAccountInfoSettingsEnvironment) => {
  const signOutMutation = useMutation(signOut, {
    onSuccess: onSignOutSuccess,
    onError: () => presentAlert("signOutError")
  })
  return {
    shouldDisableActions: signOutMutation.isLoading,
    signOutStarted: !signOutMutation.isLoading
      ? () => {
          presentAlert(
            "signOutConfirmation",
            ALERTS.signOutConfirmation.buttons(() => signOutMutation.mutate())
          )
        }
      : undefined
  }
}

export type AccountInfoSettingsProps = {
  userContactInfo: PrivacyFormattable
  style?: StyleProp<ViewStyle>
}

export const AccountInfoSettingsView = ({
  style
}: AccountInfoSettingsProps) => <View style={style} />
