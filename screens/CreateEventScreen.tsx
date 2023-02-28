import React from "react"
import {
  EventForm,
  EventFormDescriptionField,
  EventFormLocationInfo,
  EventFormSubmitButton,
  EventFormTitleField,
  EventFormToolbar
} from "@components/eventForm"
import { FixedDateRange } from "@lib/Date"
import { EventColors } from "@lib/events/EventColors"
import { useDependencyValue } from "@lib/dependencies"
import { EditEventInput, eventsDependencyKey } from "@lib/events"
import { useMutation } from "react-query"
import { dayjs } from "@lib/dayjs"

export type CreateEventScreenProps = {
  locationInfo?: EventFormLocationInfo
}

const createInitialFormValues = () => {
  const now = new Date()
  return {
    title: "",
    description: "",
    dateRange: new FixedDateRange(now, dayjs(now).add(1, "hour").toDate()),
    color: EventColors.Red,
    shouldHideAfterStartDate: false,
    radiusMeters: 0
  }
}

/**
 * A screen for creating new events.
 */
const CreateEventScreen = ({ locationInfo }: CreateEventScreenProps) => {
  const events = useDependencyValue(eventsDependencyKey)
  const createEventMutation = useMutation(async (editInput: EditEventInput) => {
    await events.createEvent(editInput)
  })
  return (
    <EventForm
      initialValues={{ ...createInitialFormValues(), locationInfo }}
      onSubmit={createEventMutation.mutateAsync}
    >
      <EventFormSubmitButton label="Create Event" />
      <EventFormTitleField />
      <EventFormDescriptionField />
      <EventFormToolbar />
    </EventForm>
  )
}

export default CreateEventScreen
