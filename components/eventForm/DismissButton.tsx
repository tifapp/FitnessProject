import React from "react"
import { Alert, TouchableOpacity } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useEventFormContext } from "./EventForm"

/**
 * A dismiss button for `EventForm`.
 *
 * If the user has edited any of the form values, this button will display
 * a confirmation alert before dismissing.
 */
export const EventFormDismissButton = () => {
  const { hasEdited, dismiss } = useEventFormContext()

  const dismissButtonTapped = () => {
    if (hasEdited) {
      Alert.alert("Discard this draft?", undefined, [
        { text: "Discard", style: "destructive", onPress: dismiss },
        { text: "Keep Editing" }
      ])
    } else {
      dismiss()
    }
  }

  return (
    <TouchableOpacity accessibilityLabel="Cancel" onPress={dismissButtonTapped}>
      <MaterialIcons name="close" size={24} />
    </TouchableOpacity>
  )
}
