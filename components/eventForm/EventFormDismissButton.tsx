import React from "react"
import { Alert, TouchableOpacity } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useEventFormContext } from "./EventForm"

export type EventFormDismissButtonProps = {
  onDismiss: () => void
}

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

  // NB: I have no idea why, but for some reason MaterialIcons doesn't render in
  // tests, so the IconButton component cannot be used here since it would require
  // moving the accessibility label (which breaks other tests)...
  return (
    <TouchableOpacity onPress={dismissButtonTapped} accessibilityLabel="Cancel">
      <MaterialIcons name="close" size={24} />
    </TouchableOpacity>
  )
}
