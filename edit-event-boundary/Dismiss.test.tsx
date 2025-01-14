import { act, renderHook } from "@testing-library/react-native"
import { ALERTS, useDismissEditEventForm } from "./Dismiss"
import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import {
  TEST_EDIT_EVENT_FORM_STORE,
  renderUseHydrateEditEvent
} from "./TestHelpers"
import { captureAlerts } from "@test-helpers/Alerts"
import { Provider } from "jotai"
import {
  defaultEditFormValues,
  EditEventFormValues
} from "@event/EditFormValues"
import { editEventFormValuesAtom } from "./FormAtoms"

describe("DismissEditEventForm tests", () => {
  describe("UseDismissEditEventForm tests", () => {
    resetTestSQLiteBeforeEach()
    const settings = PersistentSettingsStores.user(
      new SQLiteUserSettingsStorage(testSQLite)
    )
    const onDismiss = jest.fn()

    beforeEach(() => onDismiss.mockReset())

    const TEST_VALUES = { ...defaultEditFormValues(), title: "Blob" }

    it("should invoke dismiss callback immediately when no value changes to form values", () => {
      renderUseHydrateEditEvent(TEST_VALUES, settings)
      const { result } = renderUseDismissEditEventForm()
      editValues({ ...TEST_VALUES })
      expect(onDismiss).toHaveBeenCalledTimes(0)
      act(() => result.current.dismissed())
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it("should ask for confirmation when dismissing after editing a value", async () => {
      renderUseHydrateEditEvent(TEST_VALUES, settings)
      const { result } = renderUseDismissEditEventForm()
      editValues({ ...TEST_VALUES, description: "I am a changed event!" })
      act(() => result.current.dismissed())
      expect(onDismiss).toHaveBeenCalledTimes(0)
      expect(alertPresentationSpy).toHaveBeenPresentedWith(
        ALERTS.confirmDismissal()
      )
      await confirmDismissal()
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    const editValues = (values: EditEventFormValues) => {
      act(() => TEST_EDIT_EVENT_FORM_STORE.set(editEventFormValuesAtom, values))
    }

    const confirmDismissal = async () => {
      await tapAlertButton("Discard")
    }

    const { alertPresentationSpy, tapAlertButton } = captureAlerts()

    const renderUseDismissEditEventForm = () => {
      return renderHook(() => useDismissEditEventForm({ onDismiss }), {
        wrapper: ({ children }: any) => (
          <Provider store={TEST_EDIT_EVENT_FORM_STORE}>{children}</Provider>
        )
      })
    }
  })
})
