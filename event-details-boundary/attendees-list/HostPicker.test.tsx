import { EventAttendeeMocks } from "@event-details-boundary/MockData"
import { captureAlerts } from "@test-helpers/Alerts"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { fakeTimers } from "@test-helpers/Timers"
import { renderHook, waitFor } from "@testing-library/react-native"
import { EventID } from "TiFShared/domain-models/Event"
import { act } from "react-test-renderer"
import { useEventHostPicker } from "./HostPicker"

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
    const renderUseEventHostPicker = (eventId: EventID, pageSize: number) => {
      return renderHook(
        () =>
          useEventHostPicker(
            { fetchNextAttendeesPage, eventId, pageSize },
            testEnv
          ),
        {
          wrapper: ({ children }: any) => (
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )
    }
    test("selecting a new host successfully", async () => {
      const mockData = {
        attendees: [
          EventAttendeeMocks.Alivs,
          EventAttendeeMocks.AnnaAttendee,
          EventAttendeeMocks.BlobJr
        ],
        totalAttendeeCount: 3
      }
      fetchNextAttendeesPage.mockResolvedValueOnce(mockData)
      const { result } = renderUseEventHostPicker(11, 15)

      await waitFor(() =>
        expect(result.current.attendeesList.status).toEqual("success")
      )
      act(() =>
        result.current.onAttendeeSelected(
          (result.current.attendeesList as any).attendeesList.attendees()[0].id
        )
      )
      expect(result.current.selectedAttendeeId).toEqual(
        EventAttendeeMocks.AnnaAttendee.id
      )
      act(() =>
        result.current.onAttendeeSelected(
          (result.current.attendeesList as any).attendeesList.attendees()[1].id
        )
      )
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
    test("edge case: select attendee that becomes not-participating right before promotion", async () => {
      const mockData = {
        attendees: [
          EventAttendeeMocks.Alivs,
          EventAttendeeMocks.AnnaAttendee,
          EventAttendeeMocks.BlobJr
        ],
        totalAttendeeCount: 3
      }
      fetchNextAttendeesPage.mockResolvedValueOnce(mockData)
      const { result } = renderUseEventHostPicker(11, 15)

      await waitFor(() =>
        expect(result.current.attendeesList.status).toEqual("success")
      )
      act(() =>
        result.current.onAttendeeSelected(
          (result.current.attendeesList as any).attendeesList.attendees()[0].id
        )
      )
      expect(result.current.selectedAttendeeId).toEqual(
        EventAttendeeMocks.AnnaAttendee.id
      )
      act(() =>
        result.current.onAttendeeSelected(
          (result.current.attendeesList as any).attendeesList.attendees()[1].id
        )
      )
      expect(result.current.selectedAttendeeId).toEqual(
        EventAttendeeMocks.BlobJr.id
      )
      testEnv.promoteToHost.mockRejectedValueOnce("error")
      act(() => (result.current as any).submitted())
      await waitFor(() => expect(testEnv.onSuccess).not.toHaveBeenCalled())
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
    test("presents generic error alert when failure", async () => {
      const mockData = {
        attendees: [
          EventAttendeeMocks.Alivs,
          EventAttendeeMocks.AnnaAttendee,
          EventAttendeeMocks.BlobJr
        ],
        totalAttendeeCount: 3
      }
      fetchNextAttendeesPage.mockResolvedValueOnce(mockData)
      const { result } = renderUseEventHostPicker(11, 15)

      await waitFor(() =>
        expect(result.current.attendeesList.status).toEqual("success")
      )
      act(() =>
        result.current.onAttendeeSelected(
          (result.current.attendeesList as any).attendeesList.attendees()[0].id
        )
      )
      testEnv.promoteToHost.mockRejectedValueOnce(new Error())
      act(() => (result.current as any).submitted())
      await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
    })
  })
})
