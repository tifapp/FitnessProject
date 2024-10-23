import { Atomize } from "@lib/Jotai"
import { EventEdit, EventEditSchema } from "TiFShared/domain-models/Event"
import { LocationCoordinate2D } from "TiFShared/domain-models/LocationCoordinate2D"
import { Placemark } from "TiFShared/domain-models/Placemark"
import { Reassign } from "TiFShared/lib/Types/HelperTypes"
import { atom } from "jotai"

export type EditEventFormLocation =
  | {
      placemark: Placemark
      coordinate: undefined
    }
  | { placemark: undefined; coordinate: LocationCoordinate2D }
  | { placemark: Placemark; coordinate: LocationCoordinate2D }

export type EditEventFormValues = Reassign<
  EventEdit,
  "location",
  EditEventFormLocation | undefined
>

export const DEFAULT_EDIT_EVENT_FORM_VALUES = {
  title: "",
  description: "",
  location: undefined,
  startDateTime: new Date(),
  duration: 3600,
  shouldHideAfterStartDate: false
} as const

const editEventFormValuesAtom = atom<EditEventFormValues>(
  DEFAULT_EDIT_EVENT_FORM_VALUES
)

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
