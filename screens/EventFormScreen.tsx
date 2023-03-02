import { EditEventInput } from "@lib/events"
import React from "react"
import {
  EventForm,
  EventFormDescriptionField,
  EventFormDismissButton,
  EventFormSubmitButton,
  EventFormTitleField,
  EventFormToolbar,
  EventFormValues
} from "../components/eventForm"

export type EventFormScreenProps = {
  initialValues: EventFormValues
  submissionLabel: string
  onSubmit: (editInput: EditEventInput) => Promise<void>
  onDismiss: () => void
}

const EventFormScreen = ({
  initialValues,
  onSubmit,
  submissionLabel,
  onDismiss
}: EventFormScreenProps) => {
  return (
    <EventForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      onDismiss={onDismiss}
    >
      <EventFormDismissButton />
      <EventFormDescriptionField />
      <EventFormSubmitButton label={submissionLabel} />
      <EventFormTitleField />
      <EventFormToolbar />
    </EventForm>
  )
}

export default EventFormScreen
