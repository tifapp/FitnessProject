import { EventUpdateInput } from "@lib/events"
import React from "react"
import { Button } from "react-native"
import { useEventForm } from "./EventForm"
import { EventFormValues } from "./EventFormValues"

export type EventFormSubmitButtonProps = {
  label: string
}

const EventFormSubmitButton = ({ label }: EventFormSubmitButtonProps) => {
  const { isSubmitting } = useEventForm()
  const submitButtonTapped = useSubmit()
  return (
    <Button
      title={label}
      disabled={!submitButtonTapped || isSubmitting}
      onPress={() => submitButtonTapped?.()}
    />
  )
}

const useSubmit = () => {
  const { onSubmit, formValues } = useEventForm()
  const updateInput = updateInputFromFormValues(formValues())
  if (!updateInput) return undefined
  return async () => await onSubmit(updateInput)
}

const updateInputFromFormValues = (values: EventFormValues) => {
  if (values.title.length === 0 || !values.location) return undefined
  return {
    title: values.title,
    description: values.description.length > 0 ? values.description : undefined,
    location: values.location,
    startDate: values.startDate,
    endDate: values.endDate,
    color: values.color,
    shouldHideAfterStartDate: values.shouldHideAfterStartDate,
    radiusMeters: values.radiusMeters
  } as EventUpdateInput
}

export default EventFormSubmitButton
