import { useReactHookFormContext } from "@hooks/FormHooks"
import { EditEventInput } from "@lib/events"
import React, { createContext, ReactNode, useContext } from "react"
import { FormProvider, useController, useForm, useWatch } from "react-hook-form"
import { EventFormValues } from "./EventFormValues"

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
  onSubmit: (update: EditEventInput) => Promise<void>

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
  const { handleSubmit, formState } = formMethods
  return (
    <FormProvider {...formMethods}>
      <EventFormContext.Provider
        value={{
          submit: async (update) => {
            await handleSubmit(async () => await onSubmit(update))()
          },
          hasEdited: formState.isDirty
        }}
      >
        {children}
      </EventFormContext.Provider>
    </FormProvider>
  )
}

/**
 * Uses the current state of field in the event form. Calling the setter
 * function that this hook returns only causes a rerender in the components
 * that need to use the same field, not the entire form.
 */
export const useEventFormField = <
  T extends keyof EventFormValues,
  V = EventFormValues[T]
>(
    fieldName: T
  ) => {
  const { control } = useEventFormContext()
  const { field } = useController({ control, name: fieldName })
  const updateField = (value: ((_: V) => V) | V) => {
    if (value instanceof Function) {
      // TODO: - Is it possible for this to give a stale value?
      field.onChange(value(field.value as V))
    } else {
      field.onChange(value)
    }
  }
  return [field.value as V, updateField] as const
}

/**
 * Values returned by `useEventFormContext`.
 */
export type EventFormContextValues = {
  /**
   * Submits the data of this form context, in the form of an update input.
   */
  submit: (update: EditEventInput) => Promise<void>

  /**
   * True if the form has been editted.
   */
  hasEdited: boolean
}

/**
 * Returns the current values from a parent `EventForm` component.
 */
export const useEventFormContext = () => {
  const context = useContext(EventFormContext)
  if (!context) {
    throw new Error(noContextProvidedMessage)
  }

  const reactHookFormContext = useReactHookFormContext<EventFormValues>()
  return { ...context, ...reactHookFormContext }
}

const EventFormContext = createContext<EventFormContextValues | undefined>(
  undefined
)

const noContextProvidedMessage = `
An event form component attempted to use the current event form context,
but no context was provided.

To fix this, make sure to wrap the event form component with EventForm.
`

export * from "./TextFields"
export * from "./ActionButtons"
export * from "./toolbar"
export * from "./LocationBanner"
export * from "./EventFormValues"
export * from "./ColorSection"
export * from "./AdvancedSettingsSection"
export * from "./DateSection"
