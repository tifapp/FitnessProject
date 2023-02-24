import { EventUpdateInput } from "@lib/events"
import React, { createContext, ReactNode, useContext } from "react"
import { EventFormValues } from "./EventFormValues"

export type EventFormProps = {
  initialValues: EventFormValues
  onSubmit: (update: EventUpdateInput) => Promise<void>
  children: ReactNode
}

export type EventFormContext = {
  formValues: EventFormValues
  onSubmit: (update: EventUpdateInput) => Promise<void>
}

const FormContext = createContext<EventFormContext | undefined>(undefined)

export const useEventForm = () => {
  const formValues = useContext(FormContext)
  if (!formValues) {
    throw new Error(`
    An event form component attempted to use the current event form values, but none were available.

    To fix this, make sure to wrap the event form component with EventForm.
    `)
  }
  return formValues
}

const EventForm = ({ initialValues, onSubmit, children }: EventFormProps) => {
  return (
    <FormContext.Provider value={{ formValues: initialValues, onSubmit }}>
      {children}
    </FormContext.Provider>
  )
}

export default EventForm
