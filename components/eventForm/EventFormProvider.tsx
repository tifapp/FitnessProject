import { useReactHookFormContext } from "../../hooks/FormHooks"
import {
  eventsDependencyKey,
  HostedEvent,
  SaveEventInputSchema
} from "../../lib/events"
import React, {
  ReactNode,
  useContext,
  createContext,
  useState,
  useRef,
  useEffect,
  MutableRefObject
} from "react"
import { useForm, FormProvider, useController, useWatch } from "react-hook-form"
import { Alert } from "react-native"
import { useDependencyValue } from "@lib/dependencies"
import { Location } from "@lib/location"
import { FixedDateRange } from "@lib/date"
import { EventColors } from "@lib/events/EventColors"

export type EventFormTextFieldKey = "title" | "description"

export type EventFormPlacemarkInfo = Readonly<{
  name?: string
  address?: string
}>

export type EventFormLocationInfo = Readonly<{
  coordinates: Location
  placemarkInfo?: EventFormPlacemarkInfo
}>

/**
 * Values held by an `EventForm`.
 */
export type EventFormValues = Readonly<{
  id?: string
  title: string
  description: string
  locationInfo?: EventFormLocationInfo
  dateRange: FixedDateRange
  color: EventColors
  shouldHideAfterStartDate: boolean
  radiusMeters: number
}>

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
  onSubmit: (event: HostedEvent) => void

  /**
   * A handler for the dismissal of this form.
   */
  onDismiss: () => void

  children: ReactNode
}

/**
 * A context provider in which to display the ability to add and update events.
 */
export const EventFormProvider = ({
  initialValues,
  onSubmit,
  onDismiss,
  children
}: EventFormProps) => {
  const formMethods = useForm({ defaultValues: initialValues })
  const [presentedSection, setPresentedSection] = useState<
    EventFormSection | undefined
  >(undefined)
  const { setFocus } = formMethods
  const activeTextFieldRef = useRef<EventFormTextFieldKey>("title")

  useEffect(() => {
    if (!presentedSection) {
      setFocus(activeTextFieldRef.current)
    }
  }, [presentedSection, setFocus])

  return (
    <FormProvider {...formMethods}>
      <EventFormContext.Provider
        value={{
          presentedSection,
          setPresentedSection,
          onSubmit,
          onDismiss,
          activeTextFieldRef
        }}
      >
        {children}
      </EventFormContext.Provider>
    </FormProvider>
  )
}

/**
 * Sets the active text field of an event form. The active text field gets refocused
 * whenever the user dismisses the current presented section.
 */
export const useSetEventFormActiveTextField = () => {
  const { activeTextFieldRef } = useEventFormContext()
  return (key: EventFormTextFieldKey) => (activeTextFieldRef.current = key)
}

export type EventFormSubmission =
  | { canSubmit: true; submit: () => Promise<void> }
  | { canSubmit: false }

/**
 * The current event form submission.
 */
export const useEventFormSubmit = () => {
  const events = useDependencyValue(eventsDependencyKey)
  const {
    onSubmit,
    reactHookFormMethods: {
      formState: { isDirty, isSubmitting },
      watch,
      handleSubmit,
      reset
    }
  } = useEventFormContext()

  const saveInput = eventFormValuesToSaveInput(watch())
  const canSubmit = !!saveInput && !isSubmitting && isDirty

  return {
    submit: saveInput
      ? async () => {
        await handleSubmit(async () => {
          try {
            onSubmit(await events.saveEvent(saveInput))
          } catch {
            reset(undefined, { keepValues: true, keepDirty: true })
            // TODO: - Should we just forward the actual error message from the thrown error here?
            Alert.alert(
              "Something went wrong...",
              "Please check your internet connection and try again later.",
              [{ text: "Ok" }]
            )
          }
        })()
      }
      : undefined,
    canSubmit
  } as EventFormSubmission
}

const eventFormValuesToSaveInput = (values: EventFormValues) => {
  const result = SaveEventInputSchema.passthrough().safeParse({
    id: values.id,
    title: values.title,
    dateRange: values.dateRange,
    color: values.color,
    shouldHideAfterStartDate: values.shouldHideAfterStartDate,
    radiusMeters: values.radiusMeters,
    description:
      values.description.length === 0 ? undefined : values.description,
    location: values.locationInfo?.coordinates
  })
  return result.success ? result.data : undefined
}

/**
 * Dismisses the event form, but makes sure to let the user know that they may
 * have unsaved changes first.
 */
export const useEventFormDismiss = () => {
  const {
    reactHookFormMethods: {
      formState: { isDirty }
    },
    onDismiss
  } = useEventFormContext()

  return () => {
    if (isDirty) {
      Alert.alert("Discard this draft?", undefined, [
        { text: "Discard", style: "destructive", onPress: onDismiss },
        { text: "Keep Editing" }
      ])
    } else {
      onDismiss()
    }
  }
}

/**
 * Logic for the current presented section in the event form.
 */
export const useEventFormPresentedSection = () => {
  const { presentedSection, setPresentedSection } = useEventFormContext()
  return {
    presentedSection,
    presentSection: (section: EventFormSection) => {
      setPresentedSection(section)
    },
    dismissPresentedSection: () => setPresentedSection(undefined)
  }
}

export const useEventFormValue = <T extends keyof EventFormValues>(key: T) => {
  return useWatch({ name: key }) as EventFormValues[T]
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
  const { control } = useEventFormContext().reactHookFormMethods
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

type EventFormContextValues = {
  onSubmit: (event: HostedEvent) => void
  onDismiss: () => void
  presentedSection?: EventFormSection
  setPresentedSection: (section?: EventFormSection) => void
  activeTextFieldRef: MutableRefObject<EventFormTextFieldKey>
}

const useEventFormContext = () => {
  const context = useContext(EventFormContext)
  if (!context) {
    throw new Error(noContextProvidedMessage)
  }

  const reactHookFormContext = useReactHookFormContext<EventFormValues>()
  return { ...context, reactHookFormMethods: reactHookFormContext }
}

const EventFormContext = createContext<EventFormContextValues | undefined>(
  undefined
)

const noContextProvidedMessage = `
An event form component attempted to use the current event form context,
but no context was provided.

To fix this, make sure to wrap the event form component with EventForm.
`
