import { useReactHookFormContext } from "@hooks/formHooks/useReactHookFormContext"
import { HexColor } from "@lib/Color"
import { FixedDateRange } from "@lib/Date"
import { EditEventInput } from "@lib/events"
import { Location } from "@lib/location"
import React, { createContext, ReactNode, useContext } from "react"
import { FormProvider, useController, useForm, useWatch } from "react-hook-form"

export type EventFormPlacemarkInfo = {
  readonly name?: string
  readonly address?: string
}

export type EventFormLocationInfo = {
  readonly coordinates: Location
  readonly placemarkInfo?: EventFormPlacemarkInfo
}

export type EventFormValues = {
  readonly title: string
  readonly description: string
  readonly locationInfo?: EventFormLocationInfo
  readonly dateRange: FixedDateRange
  readonly color: HexColor
  readonly shouldHideAfterStartDate: boolean
  readonly radiusMeters: number
}

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
   * Submits the data of this form context, in the form of an update input.
   */
  onSubmit: (update: EditEventInput) => Promise<void>

  /**
   * True if the form is currently being submitted.
   */
  isSubmitting: boolean

  /**
   * True if the user has edited any of form fields.
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

  const reactHookFormContext = useReactHookFormContext()
  return { ...context, ...reactHookFormContext }
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
 * Returns the value of a specified field in the event form.
 */
export const useEventFormValue = <
  T extends keyof EventFormValues,
  V = EventFormValues[T]
>(
    fieldName: T
  ) => {
  return useWatch({ name: fieldName }) as V
}

/**
 * Returns the current event form values.
 */
export const useEventFormValues = () => {
  return useWatch() as EventFormValues
}

const EventFormContext = createContext<EventFormContextValues | undefined>(
  undefined
)

type EventFormProviderProps = {
  onSubmit: (update: EditEventInput) => Promise<void>
  children: ReactNode
}

const noContextProvidedMessage = `
An event form component attempted to use the current event form context,
but no context was provided.

To fix this, make sure to wrap the event form component with EventForm.
`

const EventFormProvider = ({ onSubmit, children }: EventFormProviderProps) => {
  const { handleSubmit, formState } = useReactHookFormContext()
  return (
    <EventFormContext.Provider
      value={{
        onSubmit: async (update) => {
          await handleSubmit(async () => await onSubmit(update))()
        },
        isSubmitting: formState.isSubmitting,
        hasEdited: formState.isDirty
      }}
    >
      {children}
    </EventFormContext.Provider>
  )
}
