import { act, renderHook, waitFor } from "@testing-library/react-native"
import { useEventAttendeesList } from "./AttendeesList"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { EventID } from "TiFShared/domain-models/Event"
import { InternetConnectionStatusProvider } from "@lib/InternetConnection"
import { TestInternetConnectionStatus } from "@test-helpers/InternetConnectionStatus"
import { EventMocks } from "./MockData"

describe("EventAttendeesList tests", () => {
  describe("UseEventAttendeesList tests", () => {
    const event = jest.fn()

    beforeEach(() => jest.resetAllMocks())

    it("should load the preview attendees of the event", async () => {
      event.mockResolvedValueOnce({
        status: "success",
        event: EventMocks.MockSingleAttendeeResponse
      })
      const { result } = renderUseEventAttendeesList(
        EventMocks.MockSingleAttendeeResponse.id
      )
      await waitFor(() => {
        expect((result.current as any).attendees).toEqual(
          EventMocks.MockSingleAttendeeResponse.previewAttendees
        )
      })
      expect(event).toHaveBeenCalledWith(
        EventMocks.MockSingleAttendeeResponse.id
      )
      expect(event).toHaveBeenCalledTimes(1)
    })

    it("should be able to update the relation status of a user", async () => {
      event.mockResolvedValueOnce({
        status: "success",
        event: EventMocks.MockSingleAttendeeResponse
      })
      const { result } = renderUseEventAttendeesList(
        EventMocks.MockSingleAttendeeResponse.id
      )
      await waitFor(() => {
        expect(result.current.status).toEqual("success")
      })
      expect((result.current as any).attendees[0].relationStatus).toEqual(
        "not-friends"
      )

      act(() => {
        const current = result.current as any
        current.relationStatusChanged(
          EventMocks.MockSingleAttendeeResponse.previewAttendees[0].id,
          "friend-request-sent"
        )
      })
      await waitFor(() => {
        expect((result.current as any).attendees[0].relationStatus).toEqual(
          "friend-request-sent"
        )
      })
    })

    const renderUseEventAttendeesList = (eventId: EventID) => {
      const status = new TestInternetConnectionStatus(true)
      return renderHook(() => useEventAttendeesList({ event, eventId }), {
        wrapper: ({ children }) => (
          <InternetConnectionStatusProvider status={status}>
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          </InternetConnectionStatusProvider>
        )
      })
    }
  })
})
