import { useAtomValue } from "jotai"
import { isEditEventFormDirtyAtom } from "./FormAtoms"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { TouchableIonicon } from "@components/common/Icons"
import { AlertsObject, presentAlert } from "@lib/Alerts"

export const ALERTS = {
  confirmDismissal: (onDiscard?: () => void) => ({
    title: "Discard Draft?",
    description:
      "You have unsaved changes, discarding will remove them forever.",
    buttons: [
      { text: "Discard", style: "destructive", onPress: onDiscard },
      { text: "Keep Editing" }
    ]
  })
} satisfies AlertsObject

export type UseDismissEditEventFormEnvironment = {
  onDismiss: () => void
}

export const useDismissEditEventForm = ({
  onDismiss
}: UseDismissEditEventFormEnvironment) => {
  const isDirty = useAtomValue(isEditEventFormDirtyAtom)
  return {
    dismissed: () => {
      if (!isDirty) {
        onDismiss()
      } else {
        presentAlert(ALERTS.confirmDismissal(onDismiss))
      }
    }
  }
}

export type EditEventFormDismissButtonProps = {
  onDismiss: () => void
  style?: StyleProp<ViewStyle>
}

export const EditEventFormDismissButton = ({
  onDismiss,
  style
}: EditEventFormDismissButtonProps) => (
  <View style={style}>
    <TouchableIonicon
      icon={{ name: "close" }}
      accessibilityLabel="Cancel Editing"
      onPress={useDismissEditEventForm({ onDismiss }).dismissed}
      style={styles.button}
    />
  </View>
)

const styles = StyleSheet.create({
  button: {
    marginLeft: 16
  }
})
