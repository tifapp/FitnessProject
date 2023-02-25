import React from "react"
import { Alert, TouchableOpacity } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useEventFormContext } from "./EventForm"

/**
 * Props for `EventFormDismissButton`.
 */
export type EventFormDismissButtonProps = {
  onDismiss: () => void
}

/**
 * A dismiss button for `EventForm`.
 *
 * If the user has edited any of the form values, this button will display
 * a confirmation alert before dismissing.
 */
export const EventFormDismissButton = ({
  onDismiss
}: EventFormDismissButtonProps) => {
  const { hasEdited } = useEventFormContext()

  const dismissButtonTapped = () => {
    if (hasEdited) {
      Alert.alert("Discard this event?", undefined, [
        { text: "Discard", style: "cancel", onPress: onDismiss },
        { text: "Keep Editing" }
      ])
    } else {
      onDismiss()
    }
  }

  // NB: I have no idea why, but the MaterialIcons component is not rendered in
  // tests which means we can't use the IconButton component here due to where
  // it places the accessibility label...
  return (
    <TouchableOpacity onPress={dismissButtonTapped} accessibilityLabel="Cancel">
      <MaterialIcons name="close" size={24} />
    </TouchableOpacity>
  )
}
