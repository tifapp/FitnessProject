import {
  DEFAULT_EDIT_EVENT_FORM_VALUES,
  EditEventFormValues,
  editEventFormValuesAtom
} from "./FormValues"
import { renderHook } from "@testing-library/react-native"
import { useHydrateEditEvent } from "./EditEvent"
import { Provider, useAtomValue } from "jotai"
import { SettingsProvider } from "@settings-storage/Hooks"
import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { mockPlacemark } from "@location/MockData"

describe("EditEvent tests", () => {
  describe("UseHydrateEditEvent tests", () => {
    resetTestSQLiteBeforeEach()
    const settings = PersistentSettingsStores.user(
      new SQLiteUserSettingsStorage(testSQLite)
    )

    it("should hydrate with presets and default values when no initial values provided", async () => {
      const placemark = mockPlacemark()
      settings.update({
        eventPresetShouldHideAfterStartDate: true,
        eventPresetPlacemark: placemark
      })
      const { result } = renderUseHydrateEditEvent(undefined)
      expect(result.current).toEqual({
        ...DEFAULT_EDIT_EVENT_FORM_VALUES,
        shouldHideAfterStartDate: true,
        location: { placemark, coordinate: undefined }
      })
    })

    it("should hydrate with initial values when provided", async () => {
      const values = {
        ...DEFAULT_EDIT_EVENT_FORM_VALUES,
        name: "Test Event",
        description: "We are a test event!"
      }
      const placemark = mockPlacemark()
      settings.update({
        eventPresetShouldHideAfterStartDate: true,
        eventPresetPlacemark: placemark
      })
      const { result } = renderUseHydrateEditEvent(values)
      expect(result.current).toEqual(values)
    })

    const useTest = (initialValues: EditEventFormValues | undefined) => {
      const values = useAtomValue(editEventFormValuesAtom)
      useHydrateEditEvent(initialValues)
      return values
    }

    const renderUseHydrateEditEvent = (
      initialValues: EditEventFormValues | undefined
    ) => {
      return renderHook(() => useTest(initialValues), {
        wrapper: ({ children }: any) => (
          <SettingsProvider userSettingsStore={settings}>
            <Provider>{children}</Provider>
          </SettingsProvider>
        )
      })
    }
  })
})
