import { EditEventFormValues } from "@event/EditFormValues"
import { SettingsProvider } from "@settings-storage/Hooks"
import { SettingsStore } from "@settings-storage/Settings"
import { renderHook } from "@testing-library/react-native"
import { Provider, createStore, useAtomValue } from "jotai"
import { UserSettings } from "TiFShared/domain-models/Settings"
import { useHydrateEditEvent } from "./EditEvent"
import { editEventFormValuesAtom } from "./FormAtoms"

export const TEST_EDIT_EVENT_FORM_STORE = createStore()

const useTest = (initialValues: EditEventFormValues | undefined) => {
  const values = useAtomValue(editEventFormValuesAtom)
  useHydrateEditEvent(initialValues)
  return values
}

export const renderUseHydrateEditEvent = (
  initialValues: EditEventFormValues | undefined,
  settings: SettingsStore<UserSettings>
) => {
  return renderHook(() => useTest(initialValues), {
    wrapper: ({ children }: any) => (
      <SettingsProvider userSettingsStore={settings}>
        <Provider store={TEST_EDIT_EVENT_FORM_STORE}>{children}</Provider>
      </SettingsProvider>
    )
  })
}
