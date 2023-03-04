import React from "react"
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native"
import { eventEditInputFromFormValues, useEventFormContext } from "."

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
  const submitButtonTapped = useSubmit()
  const color = useEventFormContext().watch("color")
  const canSubmit = !!submitButtonTapped
  return (
    <TouchableOpacity
      onPress={() => submitButtonTapped?.()}
      style={{
        ...styles.container,
        backgroundColor: color,
        shadowColor: color
      }}
    >
      <Text disabled={!canSubmit} style={styles.button}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const useSubmit = () => {
  const { formState, submit, watch } = useEventFormContext()
  const updateInput = eventEditInputFromFormValues(watch())
  const canSubmit =
    !!updateInput && !formState.isSubmitting && formState.isDirty
  if (!canSubmit) return undefined
  return async () => {
    try {
      await submit(updateInput)
    } catch {
      // TODO: - Should we just forward the actual error message from the thrown error here?
      Alert.alert(
        "Something went wrong...",
        "Please check your internet connection and try again later.",
        [{ text: "Ok" }]
      )
    }
  }
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
    fontSize: 16,
    color: "white",
    fontWeight: "bold"
  }
})
