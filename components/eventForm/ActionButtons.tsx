import React from "react"
import { Alert, Text, TouchableOpacity } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { eventEditInputFromFormValues, useEventFormContext } from "."

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
      Alert.alert("Discard this draft?", undefined, [
        { text: "Discard", style: "cancel", onPress: onDismiss },
        { text: "Keep Editing" }
      ])
    } else {
      onDismiss()
    }
  }

  return (
    <TouchableOpacity onPress={dismissButtonTapped} accessibilityLabel="Cancel">
      <MaterialIcons name="close" size={24} />
    </TouchableOpacity>
  )
}

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
      style={{ backgroundColor: color }}
    >
      <Text disabled={!canSubmit}>{label}</Text>
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
      // TODO: - Should we just forward the actual error message here?
      Alert.alert(
        "Something went wrong...",
        "Please check your internet connection and try again later.",
        [{ text: "Ok" }]
      )
    }
  }
}
