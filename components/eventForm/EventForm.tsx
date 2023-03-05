import { useReactHookFormContext } from "@hooks/FormHooks"
import { EditEventInput } from "@lib/events"
import React, {
  ReactNode,
  useContext,
  createContext,
  useState,
  useRef,
  useEffect
} from "react"
import { useForm, FormProvider, useController } from "react-hook-form"
import { Keyboard } from "react-native"
import { EventFormValues } from "./EventFormValues"

export type EventFormSection = "date" | "color" | "advanced"

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

  /**
   * A handler for the dismissal of this form.
   */
  onDismiss: () => void

  children: ReactNode
}

/**
 * A context provider in which to display the ability to add and update events.
 */
export const EventForm = ({
  initialValues,
  onSubmit,
  onDismiss,
  children
}: EventFormProps) => {
  const formMethods = useForm({
    defaultValues: initialValues
  })
  const { handleSubmit, formState, setFocus } = formMethods
  const [currentSection, setCurrentSection] = useState<
    EventFormSection | undefined
  >()
  const focusedField = useRef<keyof EventFormValues>("title")

  useEffect(() => {
    if (!currentSection) {
      setFocus(focusedField.current)
    }
  }, [currentSection])

  return (
    <FormProvider {...formMethods}>
      <EventFormContext.Provider
        value={{
          submit: async (update) => {
            await handleSubmit(async () => await onSubmit(update))()
          },
          dismiss: onDismiss,
          hasEdited: formState.isDirty,
          currentPresentedSection: currentSection,
          openSection: (section) => {
            Keyboard.dismiss()
            setCurrentSection(section)
          },
          dismissCurrentSection: () => setCurrentSection(undefined),
          setFocusedField: (name) => {
            focusedField.current = name
          }
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
  return [field.value as V, updateField, field.ref] as const
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
   * Dismisses this form.
   */
  dismiss: () => void

  /**
   * True if the form has been editted.
   */
  hasEdited: boolean

  /**
   * The current section being presented in the `EventFormBottomSheet` component.
   */
  currentPresentedSection?: EventFormSection

  /**
   * Opens a section to be displayed in the `EventFormBottomSheet` component.
   */
  openSection: (section: EventFormSection) => void

  /**
   * Dismisses the current section and closes the `EventFormBottomSheet`.
   */
  dismissCurrentSection: () => void

  /**
   * Sets the current focused field in the form. When the form mounts or when the
   * bottom sheet disappears, the currently set field will be focused.
   */
  setFocusedField: (name: keyof EventFormValues) => void
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
