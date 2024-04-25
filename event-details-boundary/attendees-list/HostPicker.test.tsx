import { EventAttendeeMocks } from "@event-details-boundary/MockData"
import { captureAlerts } from "@test-helpers/Alerts"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import { neverPromise } from "@test-helpers/Promise"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { fakeTimers } from "@test-helpers/Timers"
import { renderHook, waitFor } from "@testing-library/react-native"
import { act } from "react-test-renderer"
import { HOST_PICKER_ERROR_ALERTS, useEventHostPicker } from "./HostPicker"

describe("EventHostPicker tests", () => {
  describe("UseLeaveEventHostPicker tests", () => {
    fakeTimers()
    beforeEach(() => jest.resetAllMocks())
    const testEnv = {
      promoteToHost: jest.fn(),
      onSuccess: jest.fn()
    }
    const { alertPresentationSpy } = captureAlerts()
    const fetchNextAttendeesPage = jest.fn()
    const renderUseEventHostPicker = async () => {
      const mockData = {
        attendees: [
          EventAttendeeMocks.Alivs,
          EventAttendeeMocks.AnnaAttendee,
          EventAttendeeMocks.BlobJr
        ],
        totalAttendeeCount: 3
      }
      fetchNextAttendeesPage.mockResolvedValueOnce(mockData)
      const { result } = renderHook(
        () =>
          useEventHostPicker(
            { fetchNextAttendeesPage, eventId: 11, pageSize: 15 },
            testEnv
          ),
        {
          wrapper: ({ children }: any) => (
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )

      await waitFor(() =>
        expect(result.current.attendeesList.status).toEqual("success")
      )

      return result
    }

    test("selecting a new host successfully", async () => {
      const result = await renderUseEventHostPicker()
      selectAttendeeWithIndex(result.current, 0)
      expect(result.current.selectedAttendeeId).toEqual(
        EventAttendeeMocks.AnnaAttendee.id
      )
      selectAttendeeWithIndex(result.current, 1)
      expect(result.current.selectedAttendeeId).toEqual(
        EventAttendeeMocks.BlobJr.id
      )
      testEnv.promoteToHost.mockResolvedValueOnce("success")
      act(() => (result.current as any).submitted())
      await waitFor(() => expect(testEnv.onSuccess).toHaveBeenCalled())
      expect(testEnv.promoteToHost).toHaveBeenCalledWith(
        EventAttendeeMocks.BlobJr.id
      )
      expect((result.current.attendeesList as any).attendeesList.host).toEqual(
        EventAttendeeMocks.BlobJr
      )
      expect(
        (result.current.attendeesList as any).attendeesList.attendees()
      ).toEqual([EventAttendeeMocks.AnnaAttendee, EventAttendeeMocks.Alivs])
    })

    test("select attendee that becomes not-participating right before promotion", async () => {
      const result = await renderUseEventHostPicker()
      selectAttendeeWithIndex(result.current, 1)
      testEnv.promoteToHost.mockResolvedValueOnce("user-not-attending")
      act(() => (result.current as any).submitted())
      await verifyNeverOccurs(() =>
        expect(testEnv.onSuccess).toHaveBeenCalled()
      )
      expect(testEnv.promoteToHost).toHaveBeenCalledWith(
        EventAttendeeMocks.BlobJr.id
      )
      expect((result.current.attendeesList as any).attendeesList.host).toEqual(
        EventAttendeeMocks.Alivs
      )
      await waitFor(() =>
        expect(result.current.selectedAttendeeId).toBeUndefined()
      )
    })

    test("select attendee that becomes not-participating right before promotion, presents error alert", async () => {
      const result = await renderUseEventHostPicker()
      selectAttendeeWithIndex(result.current, 0)
      testEnv.promoteToHost.mockResolvedValueOnce("user-not-attending")
      act(() => (result.current as any).submitted())
      await waitFor(() =>
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          HOST_PICKER_ERROR_ALERTS["user-not-attending"].title,
          HOST_PICKER_ERROR_ALERTS["user-not-attending"].description
        )
      )
    })

    test("cannot submit while loading", async () => {
      testEnv.promoteToHost.mockImplementation(neverPromise)
      const result = await renderUseEventHostPicker()
      selectAttendeeWithIndex(result.current, 0)
      act(() => (result.current as any).submitted())
      await waitFor(() => expect(result.current.submitted).toEqual(false))
    })

    test("presents generic error alert when failure", async () => {
      const result = await renderUseEventHostPicker()
      selectAttendeeWithIndex(result.current, 0)
      testEnv.promoteToHost.mockRejectedValueOnce(new Error())
      act(() => (result.current as any).submitted())
      await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
    })

    const selectAttendeeWithIndex = (
      result: ReturnType<typeof useEventHostPicker>,
      attendeeIndex: number
    ) => {
      act(() =>
        result.onAttendeeSelected(
          (result.attendeesList as any).attendeesList.attendees()[attendeeIndex]
            .id
        )
      )
    }
  })
})
