import { PersistentSettingsStores } from "@settings-storage/PersistentStores"
import { SQLiteUserSettingsStorage } from "@settings-storage/UserSettings"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { editEventFormValuesAtom } from "./FormAtoms"
import {
  TEST_EDIT_EVENT_FORM_STORE,
  renderUseHydrateEditEvent
} from "./TestHelpers"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { ALERTS, submitEventEdit, useEditEventFormSubmission } from "./Submit"
import { SettingsProvider } from "@settings-storage/Hooks"
import { Provider } from "jotai"
import { LocationCoordinatesMocks, mockPlacemark } from "@location/MockData"
import { captureAlerts } from "@test-helpers/Alerts"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "@test-helpers/ReactQuery"
import { EventEdit, EventID } from "TiFShared/domain-models/Event"
import { EventMocks } from "@event-details-boundary/MockData"
import { renderUseLoadEventDetails } from "@event-details-boundary/TestHelpers"
import { TestInternetConnectionStatus } from "@test-helpers/InternetConnectionStatus"
import { neverPromise } from "@test-helpers/Promise"
import { mockTiFEndpoint } from "TiFShared/test-helpers/mockAPIServer"
import { fakeTimers } from "@test-helpers/Timers"
import { TiFAPI } from "TiFShared/api"
import {
  defaultEditFormValues,
  EditEventFormValues
} from "@event/EditFormValues"

describe("EditEventSubmit tests", () => {
  describe("SubmitEventEdit tests", () => {
    fakeTimers()
    const TEST_CLIENT_RECEIVED_TIME = new Date()
    const EXPECTED_CLIENT_SIDE_EVENT = {
      ...EventMocks.MockSingleAttendeeResponse,
      time: {
        ...EventMocks.MockSingleAttendeeResponse.time,
        clientReceivedTime: TEST_CLIENT_RECEIVED_TIME
      }
    }
    const TEST_EVENT_EDIT = {
      title: "Blob",
      startDateTime: new Date(),
      duration: 3600,
      shouldHideAfterStartDate: false,
      description: "This is a wonderful event.",
      location: {
        type: "coordinate",
        value: LocationCoordinatesMocks.SantaCruz
      }
    } satisfies EventEdit
    beforeEach(() => jest.setSystemTime(TEST_CLIENT_RECEIVED_TIME))

    it("should create an event when no id specified", async () => {
      mockTiFEndpoint("createEvent", 201, EventMocks.MockSingleAttendeeResponse)
      const result = await submitEventEdit(
        undefined,
        TEST_EVENT_EDIT,
        TiFAPI.testAuthenticatedInstance
      )
      expect(result).toEqual({
        status: "success",
        event: EXPECTED_CLIENT_SIDE_EVENT
      })
    })

    it("should edit the event when id specified", async () => {
      mockTiFEndpoint("editEvent", 200, EventMocks.MockSingleAttendeeResponse)
      const result = await submitEventEdit(
        EXPECTED_CLIENT_SIDE_EVENT.id,
        TEST_EVENT_EDIT,
        TiFAPI.testAuthenticatedInstance
      )
      expect(result).toEqual({
        status: "success",
        event: EXPECTED_CLIENT_SIDE_EVENT
      })
    })

    it("should return an error status when editing in invalid conditions", async () => {
      mockTiFEndpoint("editEvent", 403, { error: "user-not-host" })
      const result = await submitEventEdit(
        EXPECTED_CLIENT_SIDE_EVENT.id,
        TEST_EVENT_EDIT,
        TiFAPI.testAuthenticatedInstance
      )
      expect(result).toEqual({ status: "user-not-host" })
    })

    it("should return an error status when event not found", async () => {
      mockTiFEndpoint("editEvent", 404, { error: "event-not-found" })
      const result = await submitEventEdit(
        EXPECTED_CLIENT_SIDE_EVENT.id,
        TEST_EVENT_EDIT,
        TiFAPI.testAuthenticatedInstance
      )
      expect(result).toEqual({ status: "event-not-found" })
    })
  })

  describe("UseEditEventSubmission tests", () => {
    resetTestSQLiteBeforeEach()
    fakeTimers()
    const settings = PersistentSettingsStores.user(
      new SQLiteUserSettingsStorage(testSQLite)
    )
    const onSuccess = jest.fn()
    const submit = jest.fn()
    const queryClient = createTestQueryClient()

    beforeEach(() => {
      jest.setSystemTime(new Date(20_000))
      queryClient.resetQueries()
      onSuccess.mockReset()
      submit.mockReset()
    })

    const TEST_VALUES = {
      ...defaultEditFormValues(),
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
      submit.mockResolvedValueOnce({
        status: "success",
        event: EventMocks.PickupBasketball
      })
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
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(EventMocks.PickupBasketball)
      })
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
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          ALERTS.submissionError()
        )
      })
      expect(onSuccess).not.toHaveBeenCalled()
    })

    it("should present an error alert when the submission returns an invalid status", async () => {
      submit.mockResolvedValueOnce({ status: "event-not-found" })
      renderUseHydrateEditEvent(TEST_VALUES, settings)
      const { result } = renderUseEditEventSubmission()
      const newValues = { ...TEST_VALUES, title: "Something different" }
      editValues(newValues)
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          ALERTS["event-not-found"]
        )
      })
      expect(onSuccess).not.toHaveBeenCalled()
    })

    it("should update the details of an event after it has been edited", async () => {
      submit.mockResolvedValueOnce({
        status: "success",
        event: EventMocks.PickupBasketball
      })
      renderUseHydrateEditEvent(TEST_VALUES, settings)
      const { result } = renderUseEditEventSubmission(
        EventMocks.PickupBasketball.id
      )
      const { result: eventDetails } = renderEventDetails(
        EventMocks.PickupBasketball.id
      )
      const newValues = { ...TEST_VALUES, title: "Something different" }
      editValues(newValues)
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        expect(eventDetails.current).toMatchObject({
          status: "success",
          event: EventMocks.PickupBasketball
        })
      })
    })

    it("should present an edit error alert when the submission fails", async () => {
      submit.mockRejectedValueOnce(new Error())
      renderUseHydrateEditEvent(TEST_VALUES, settings)
      const { result } = renderUseEditEventSubmission(10)
      const newValues = { ...TEST_VALUES, title: "Something different" }
      editValues(newValues)
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          ALERTS.submissionError(10)
        )
      })
      expect(onSuccess).not.toHaveBeenCalled()
    })

    const { alertPresentationSpy } = captureAlerts()

    const renderEventDetails = (id: EventID) => {
      return renderUseLoadEventDetails(
        id,
        new TestInternetConnectionStatus(true),
        neverPromise,
        queryClient
      )
    }

    const editValues = (values: EditEventFormValues) => {
      act(() => TEST_EDIT_EVENT_FORM_STORE.set(editEventFormValuesAtom, values))
    }

    const renderUseEditEventSubmission = (eventId?: EventID) => {
      return renderHook(
        () => useEditEventFormSubmission({ eventId, submit, onSuccess }),
        {
          wrapper: ({ children }: any) => (
            <TestQueryClientProvider client={queryClient}>
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
