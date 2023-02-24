import { EventUpdateInput } from "@lib/events"
import React, { createContext, ReactNode, useContext } from "react"
import { EventFormValues } from "./EventFormValues"
import { FormProvider, useForm, useFormContext } from "react-hook-form"

export type EventFormProps = {
  initialValues: EventFormValues
  onSubmit: (update: EventUpdateInput) => Promise<void>
  children: ReactNode
}

export type EventFormContextValues = {
  formValues: () => EventFormValues
  onSubmit: (update: EventUpdateInput) => Promise<void>
  isSubmitting: boolean
}

const EventFormContext = createContext<EventFormContextValues | undefined>(
  undefined
)

type EventFormProviderProps = {
  onSubmit: (update: EventUpdateInput) => Promise<void>
  children: ReactNode
}

const EventFormProvider = ({ onSubmit, children }: EventFormProviderProps) => {
  const { handleSubmit, formState, watch } = useFormContext<EventFormValues>()
  return (
    <EventFormContext.Provider
      value={{
        formValues: watch,
        onSubmit: async (update) => {
          await handleSubmit(async () => await onSubmit(update))()
        },
        isSubmitting: formState.isSubmitting
      }}
    >
      {children}
    </EventFormContext.Provider>
  )
}

export const useEventForm = () => {
  const formValues = useContext(EventFormContext)
  if (!formValues) {
    throw new Error(`
    An event form component attempted to use the current event form values, but none were available.

    To fix this, make sure to wrap the event form component with EventForm.
    `)
  }
  return formValues
}

const EventForm = ({ initialValues, onSubmit, children }: EventFormProps) => {
  const formMethods = useForm({
    defaultValues: initialValues
  })
  return (
    <FormProvider {...formMethods}>
      <EventFormProvider onSubmit={onSubmit}>{children}</EventFormProvider>
    </FormProvider>
  )
}

export default EventForm
