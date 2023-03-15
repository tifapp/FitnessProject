import { MaterialIcon } from "@components/common/Icons"
import { FontScaleFactors } from "@lib/FontScale"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import {
  useEventFormDismiss,
  useEventFormSubmit,
  useEventFormValue
} from "./EventFormProvider"
import React from "react"

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

/**
 * Props from `EventFormSubmitButton`.
 */
export type EventFormSubmitButtonProps = {
  label: string
}

/**
 * Submit button for `EventForm`.
 */
export const EventFormSubmitButton = ({
  label
}: EventFormSubmitButtonProps) => {
  const submission = useEventFormSubmit()
  const color = useEventFormValue("color")
  return (
    <View style={{ opacity: submission.canSubmit ? 1 : 0.5 }}>
      <TouchableOpacity
        onPress={() => {
          if (submission.canSubmit) submission.submit()
        }}
        disabled={!submission.canSubmit}
        style={{
          ...styles.submitButtonContainer,
          backgroundColor: color,
          shadowColor: color
        }}
      >
        <Text
          maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
          disabled={!submission.canSubmit}
          style={styles.submitButton}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  submitButtonContainer: {
    borderRadius: 12,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }
  },
  submitButton: {
    padding: 8,
    color: "white",
    fontWeight: "bold"
  }
})
