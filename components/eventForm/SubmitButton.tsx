import { FontScaleFactors } from "../../lib/FontScale"
import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useEventFormSubmit, useEventFormValue } from "./EventFormProvider"

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
          ...styles.container,
          backgroundColor: color,
          shadowColor: color
        }}
      >
        <Text
          maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
          disabled={!submission.canSubmit}
          style={styles.button}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }
  },
  button: {
    padding: 8,
    color: "white",
    fontWeight: "bold"
  }
})
