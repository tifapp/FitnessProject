import React from "react"
import { Alert, TouchableOpacity } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useEventFormContext } from "."

/**
 * A dismiss button for `EventForm`.
 *
 * If the user has edited any of the form values, this button will display
 * a confirmation alert before dismissing.
 */
export const EventFormDismissButton = () => {
  const { hasEdited, dismiss } = useEventFormContext()

  const dismissButtonTapped = () => {
    console.log(hasEdited)
    if (hasEdited) {
      Alert.alert("Discard this draft?", undefined, [
        { text: "Discard", style: "cancel", onPress: dismiss },
        { text: "Keep Editing" }
      ])
    } else {
      dismiss()
    }
  }

  return (
    <TouchableOpacity onPress={dismissButtonTapped} accessibilityLabel="Cancel">
      <MaterialIcons name="close" size={24} />
    </TouchableOpacity>
  )
}
