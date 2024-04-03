import { EventAttendeeMocks } from "@event-details/MockData"
import { EventID } from "@shared-models/Event"
import { captureAlerts } from "@test-helpers/Alerts"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { renderHook, waitFor } from "@testing-library/react-native"
import { act } from "react-test-renderer"
import { useEventHostPicker } from "./HostPicker"

describe("EventHostPicker tests", () => {
  describe("UseLeaveEventHostPicker tests", () => {
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
          (result.current.attendeesList as any).attendees[0].id
        )
      )
      expect(result.current.selectedAttendeeId).toEqual(
        EventAttendeeMocks.AnnaAttendee.id
      )
      act(() =>
        result.current.onAttendeeSelected(
          (result.current.attendeesList as any).attendees[1].id
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
      expect((result.current.attendeesList as any).host).toEqual(
        EventAttendeeMocks.BlobJr
      )
      expect((result.current.attendeesList as any).attendees).toEqual([
        EventAttendeeMocks.Alivs,
        EventAttendeeMocks.AnnaAttendee
      ])
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
          (result.current.attendeesList as any).attendees[0].id
        )
      )
      testEnv.promoteToHost.mockRejectedValueOnce(new Error())
      act(() => (result.current as any).submitted())
      await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalled())
    })
  })
})
