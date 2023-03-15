import React from "react"
import { TouchableOpacity } from "react-native"
import { useEventFormDismiss } from "./EventFormProvider"
import { MaterialIcon } from "@components/common/Icons"
import { FontScaleFactors } from "@lib/FontScale"

/**
 * A dismiss button for `EventForm`.
 *
 * If the user has edited any of the form values, this button will display
 * a confirmation alert before dismissing.
 */
export const EventFormDismissButton = () => (
  <TouchableOpacity accessibilityLabel="Cancel" onPress={useEventFormDismiss()}>
    <MaterialIcon
      name="close"
      maximumFontScaleFactor={FontScaleFactors.xxxLarge}
    />
  </TouchableOpacity>
)
