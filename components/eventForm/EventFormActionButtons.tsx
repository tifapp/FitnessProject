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
      Alert.alert("Discard this event?", undefined, [
        { text: "Discard", style: "cancel", onPress: onDismiss },
        { text: "Keep Editing" }
      ])
    } else {
      onDismiss()
    }
  }

  // NB: I have no idea why, but the MaterialIcons component is not rendered in
  // tests which means we can't use the IconButton component here due to where
  // it places the accessibility label (changing where it does breaks other tests)...
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
  testID?: string
  label: string
}

/**
 * Submit button for `EventForm`.
 */
export const EventFormSubmitButton = ({
  label,
  testID
}: EventFormSubmitButtonProps) => {
  const submitButtonTapped = useSubmit()
  const color = useEventFormValue("color")
  const canSubmit = !!submitButtonTapped
  return (
    <TouchableOpacity
      testID={testID}
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
      Alert.alert(
        "Something went wrong...",
        "Uh Oh! Something didn't go well... Please check your internet connection and try again later.",
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
