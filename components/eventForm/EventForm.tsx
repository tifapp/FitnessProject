import { EventUpdateInput } from "@lib/events"
import React, { createContext, ReactNode, useContext } from "react"
import { EventFormValues } from "./EventFormValues"
import { FormProvider, useForm, useFormContext } from "react-hook-form"

/**
 * Props for `EventForm`.
 */
export type EventFormProps = {
  /**
   * The initial values to use in the form, updates to this field
   * will not update the current form values.
   */
  initialValues: EventFormValues

  /**
   * Handles the submission of the form. This method should not throw
   * any errors and should handle them internally.
   */
  onSubmit: (update: EventUpdateInput) => Promise<void>

  children: ReactNode
}

/**
 * A context provider in which to display the ability to add and update events.
 */
export const EventForm = ({
  initialValues,
  onSubmit,
  children
}: EventFormProps) => {
  const formMethods = useForm({
    defaultValues: initialValues
  })
  return (
    <FormProvider {...formMethods}>
      <EventFormProvider onSubmit={onSubmit}>{children}</EventFormProvider>
    </FormProvider>
  )
}

/**
 * Values returned by `useEventFormContext`.
 */
export type EventFormContextValues = {
  /**
   * Retrieves the current form values. A call to this method will rerender the
   * caller component whenever the form values change.
   */
  formValues: () => EventFormValues

  /**
   * Submits the data of this form context, in the form of an update input.
   */
  onSubmit: (update: EventUpdateInput) => Promise<void>

  /**
   * True if the form is currently being submitted.
   */
  isSubmitting: boolean
}

/**
 * Returns the current values from a parent `EventForm` component.
 */
export const useEventFormContext = () => {
  const formValues = useContext(EventFormContext)
  if (!formValues) {
    throw new Error(`
    An event form component attempted to use the current event form values, but none were available.

    To fix this, make sure to wrap the event form component with EventForm.
    `)
  }
  return formValues
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
