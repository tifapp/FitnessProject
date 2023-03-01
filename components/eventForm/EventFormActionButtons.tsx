import React from "react"
import { Alert, Text, TouchableOpacity } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import {
  EventFormValues,
  useEventFormContext,
  useEventFormValue,
  useEventFormValues
} from "./EventForm"
import { EditEventInput } from "@lib/events"

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
  const color = useEventFormValue("color")
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
  const { isSubmitting, onSubmit, hasEdited } = useEventFormContext()
  const formValues = useEventFormValues()
  const updateInput = eventEditInputFromFormValues(formValues)
  const canSubmit = !!updateInput && !isSubmitting && hasEdited
  if (!canSubmit) return undefined
  return async () => {
    try {
      await onSubmit(updateInput)
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

const eventEditInputFromFormValues = (values: EventFormValues) => {
  if (values.title.length === 0 || !values.locationInfo) return undefined
  return {
    title: values.title,
    description: values.description.length > 0 ? values.description : undefined,
    location: values.locationInfo.coordinates,
    dateRange: values.dateRange,
    color: values.color,
    shouldHideAfterStartDate: values.shouldHideAfterStartDate,
    radiusMeters: values.radiusMeters
  } as EditEventInput
}
