import { EventUpdateInput } from "@lib/events"
import React, { useState } from "react"
import { Button } from "react-native"
import { useEventForm } from "./EventForm"
import { EventFormValues } from "./EventFormValues"

export type EventFormSubmitButtonProps = {
  label: string
}

const EventFormSubmitButton = ({ label }: EventFormSubmitButtonProps) => {
  const { formValues } = useEventForm()
  const updateInput = updateInputFromFormValues(formValues)
  const submission = updateInput ? useSubmitUpdateInput(updateInput) : undefined

  return (
    <Button
      title={label}
      disabled={!submission || submission.isSubmitting}
      onPress={() => submission?.submitButtonTapped()}
    />
  )
}

const useSubmitUpdateInput = (updateInput: EventUpdateInput) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { onSubmit } = useEventForm()

  const submitButtonTapped = async () => {
    setIsSubmitting(true)
    await onSubmit(updateInput)
    setIsSubmitting(false)
  }

  return { isSubmitting, submitButtonTapped }
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
