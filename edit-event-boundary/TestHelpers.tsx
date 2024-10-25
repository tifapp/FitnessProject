import { renderHook } from "@testing-library/react-native"
import { Provider, createStore, useAtomValue } from "jotai"
import { useHydrateEditEvent } from "./EditEvent"
import { EditEventFormValues, editEventFormValuesAtom } from "./FormValues"
import { SettingsProvider } from "@settings-storage/Hooks"
import { SettingsStore } from "@settings-storage/Settings"
import { UserSettings } from "TiFShared/domain-models/Settings"

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
