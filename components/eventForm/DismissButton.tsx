import React from "react"
import { Alert, TouchableOpacity } from "react-native"
import { useEventFormContext } from "./EventForm"
import { MaterialIcon } from "@components/common/Icons"
import { FontScaleFactors } from "@lib/Fonts"

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
      <MaterialIcon
        name="close"
        maximumFontScaleFactor={FontScaleFactors.xxxLarge}
      />
    </TouchableOpacity>
  )
}
