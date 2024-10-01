import { useAtomValue } from "jotai"
import { isEditEventFormDirtyAtom } from "./FormValues"
import { Alert, StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { TouchableIonicon } from "@components/common/Icons"

export const ALERTS = {
  confirmDismissal: {
    title: "Discard Draft?",
    message: "You have unsaved changes, discarding will remove them forever.",
    buttons: (onDiscard: () => void) => [
      { text: "Discard", style: "destructive" as const, onPress: onDiscard },
      { text: "Keep Editing" }
    ]
  }
}

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
        Alert.alert(
          ALERTS.confirmDismissal.title,
          ALERTS.confirmDismissal.message,
          ALERTS.confirmDismissal.buttons(onDismiss)
        )
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
