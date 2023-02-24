import { EventUpdateInput } from "@lib/events"
import React, { useState } from "react"
import { Button } from "react-native"
import { useEventForm } from "./EventForm"
import { EventFormValues } from "./EventFormValues"

export type EventFormSubmitButtonProps = {
  label: string
}

const EventFormSubmitButton = ({ label }: EventFormSubmitButtonProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { formValues, onSubmit } = useEventForm()
  const updateInput = updateInputFromFormValues(formValues)

  const submitButtonTapped = async () => {
    setIsSubmitting(true)
    await onSubmit(updateInput!!)
    setIsSubmitting(false)
  }

  return (
    <Button
      title={label}
      disabled={!updateInput || isSubmitting}
      onPress={() => submitButtonTapped()}
    />
  )
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
