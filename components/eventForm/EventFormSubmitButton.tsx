import { EditEventInput } from "@lib/events"
import React from "react"
import { Button } from "react-native"
import { useEventFormContext, useEventFormValues } from "./EventForm"
import { EventFormValues } from "./EventFormValues"

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
  const canSubmit = !!submitButtonTapped
  return (
    <Button
      title={label}
      disabled={!canSubmit}
      onPress={() => submitButtonTapped?.()}
    />
  )
}

const useSubmit = () => {
  const { isSubmitting, onSubmit } = useEventFormContext()
  const formValues = useEventFormValues()
  const updateInput = eventEditInputFromFormValues(formValues)
  const canSubmit = !!updateInput && !isSubmitting
  if (!canSubmit) return undefined
  return async () => await onSubmit(updateInput)
}

const eventEditInputFromFormValues = (values: EventFormValues) => {
  if (values.title.length === 0 || !values.locationInfo) return undefined
  return {
    title: values.title,
    description: values.description.length > 0 ? values.description : undefined,
    location: values.locationInfo.coordinates,
    startDate: values.startDate,
    endDate: values.endDate,
    color: values.color,
    shouldHideAfterStartDate: values.shouldHideAfterStartDate,
    radiusMeters: values.radiusMeters
  } as EditEventInput
}
