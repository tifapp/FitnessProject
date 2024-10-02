import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import {
  DEFAULT_EDIT_EVENT_FORM_VALUES,
  EditEventFormValues,
  editEventFormValuesAtom
} from "./FormValues"
import {
  TEST_EDIT_EVENT_FORM_STORE,
  renderUseHydrateEditEvent
} from "./TestHelpers"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { ALERTS, useEditEventFormSubmission } from "./Submit"
import { SettingsProvider } from "@settings-storage/Hooks"
import { Provider } from "jotai"
import { mockPlacemark } from "@location/MockData"
import { captureAlerts } from "@test-helpers/Alerts"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { EventID } from "TiFShared/domain-models/Event"

describe("EditEventSubmit tests", () => {
  describe("UseEditEventSubmission tests", () => {
    resetTestSQLiteBeforeEach()
    const settings = PersistentSettingsStores.user(
      new SQLiteUserSettingsStorage(testSQLite)
    )
    const onSuccess = jest.fn()
    const submit = jest.fn()

    beforeEach(() => {
      onSuccess.mockReset()
      submit.mockReset()
    })

    const TEST_VALUES = {
      ...DEFAULT_EDIT_EVENT_FORM_VALUES,
      title: "Blob",
      location: { placemark: mockPlacemark(), coordinate: undefined }
    }

    it("should not be able to submit the initial event", () => {
      renderUseHydrateEditEvent(TEST_VALUES, settings)
      const { result } = renderUseEditEventSubmission()
      expect(result.current.submission.status).toEqual("invalid")
    })

    it("should not be able to submit an invalid event", () => {
      renderUseHydrateEditEvent(TEST_VALUES, settings)
      const { result } = renderUseEditEventSubmission()
      editValues({ ...TEST_VALUES, title: "" })
      expect(result.current.submission.status).toEqual("invalid")
    })

    it("should submit a changed valid event", async () => {
      renderUseHydrateEditEvent(TEST_VALUES, settings)
      const { result } = renderUseEditEventSubmission(10)
      const newValues = { ...TEST_VALUES, title: "Something different" }
      editValues(newValues)
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        expect(submit).toHaveBeenCalledWith(10, {
          ...newValues,
          location: { type: "placemark", value: newValues.location.placemark }
        })
      })
      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
      expect(submit).toHaveBeenCalledTimes(1)
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    it("should present a creation error alert when the submission fails", async () => {
      submit.mockRejectedValueOnce(new Error())
      renderUseHydrateEditEvent(TEST_VALUES, settings)
      const { result } = renderUseEditEventSubmission()
      const newValues = { ...TEST_VALUES, title: "Something different" }
      editValues(newValues)
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        const alertContents = ALERTS.submissionError(undefined)
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          alertContents.title,
          alertContents.message
        )
      })
      expect(onSuccess).not.toHaveBeenCalled()
    })

    it("should present an edit error alert when the submission fails", async () => {
      submit.mockRejectedValueOnce(new Error())
      renderUseHydrateEditEvent(TEST_VALUES, settings)
      const { result } = renderUseEditEventSubmission(10)
      const newValues = { ...TEST_VALUES, title: "Something different" }
      editValues(newValues)
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        const alertContents = ALERTS.submissionError(10)
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          alertContents.title,
          alertContents.message
        )
      })
      expect(onSuccess).not.toHaveBeenCalled()
    })

    const { alertPresentationSpy } = captureAlerts()

    const editValues = (values: EditEventFormValues) => {
      act(() => TEST_EDIT_EVENT_FORM_STORE.set(editEventFormValuesAtom, values))
    }

    const renderUseEditEventSubmission = (eventId?: EventID) => {
      return renderHook(
        () => useEditEventFormSubmission({ eventId, submit, onSuccess }),
        {
          wrapper: ({ children }: any) => (
            <TestQueryClientProvider>
              <SettingsProvider userSettingsStore={settings}>
                <Provider store={TEST_EDIT_EVENT_FORM_STORE}>
                  {children}
                </Provider>
              </SettingsProvider>
            </TestQueryClientProvider>
          )
        }
      )
    }
  })
})
