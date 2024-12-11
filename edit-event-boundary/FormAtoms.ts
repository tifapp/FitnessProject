import {
  EditEventFormValues,
  DEFAULT_EDIT_EVENT_FORM_VALUES
} from "@event/EditFormValues"
import { Atomize } from "@lib/Jotai"
import { EventEdit, EventEditSchema } from "TiFShared/domain-models/Event"
import { shallowEquals } from "TiFShared/lib/ShallowEquals"
import { atom } from "jotai"

export const editEventFormValuesAtom = atom<EditEventFormValues>(
  DEFAULT_EDIT_EVENT_FORM_VALUES
)
export const editEventFormInitialValuesAtom = atom<EditEventFormValues>(
  DEFAULT_EDIT_EVENT_FORM_VALUES
)

export const isEditEventFormDirtyAtom = atom((get) => {
  const initialValues = get(editEventFormInitialValuesAtom)
  const currentValues = get(editEventFormValuesAtom)
  return !shallowEquals(initialValues, currentValues)
})

const editEventAtom = <
  const K extends keyof EditEventFormValues,
  Value extends EditEventFormValues[K]
>(
  key: K
) => {
  return atom(
    (get) => get(editEventFormValuesAtom)[key],
    (get, set, newValue: Value) => {
      set(editEventFormValuesAtom, {
        ...get(editEventFormValuesAtom),
        [key]: newValue
      })
    }
  )
}

export const editEventFormValueAtoms = Object.keys(
  DEFAULT_EDIT_EVENT_FORM_VALUES
).reduce((acc, key: keyof EditEventFormValues) => {
  return { ...acc, [key]: editEventAtom(key) }
}, {} as Atomize<EditEventFormValues>)

export const eventEditAtom = atom<EventEdit | undefined>((get) => {
  const formValues = get(editEventFormValuesAtom)
  const result = EventEditSchema.safeParse({
    ...formValues,
    location: {
      type: formValues.location?.placemark ? "placemark" : "coordinate",
      value: formValues.location?.placemark ?? formValues.location?.coordinate
    }
  })
  return result.success ? result.data : undefined
})
