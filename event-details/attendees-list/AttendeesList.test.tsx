import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { act, renderHook, waitFor } from "@testing-library/react-native"

import { EventAttendeeMocks } from "@event-details/MockData"
import { fakeTimers } from "@test-helpers/Timers"
import { useAttendeesList } from "./AttendeesList"

describe("Attendees List tests", () => {
  afterEach(() => act(() => jest.runAllTimers()))
  fakeTimers()
  beforeEach(() => jest.resetAllMocks())
  const fetchNextAttendeesPage = jest.fn()

  const renderUseAttendeesList = (eventId: number, pageSize: number) => {
    return renderHook(
      () => useAttendeesList(fetchNextAttendeesPage, eventId, pageSize),
      {
        wrapper: ({ children }) => (
          <TestQueryClientProvider>{children}</TestQueryClientProvider>
        )
      }
    )
  }

  describe("Attendees List hook tests", () => {
    it("loads first page correctly", async () => {
      const mockData = {
        attendees: [EventAttendeeMocks.Alivs, EventAttendeeMocks.AnnaAttendee],
        attendeeCount: 2
      }
      fetchNextAttendeesPage.mockResolvedValueOnce(mockData)
      const { result } = renderUseAttendeesList(11, 15)

      expect(result.current.status).toEqual("loading")
      expect(result.current.host).toBeUndefined()
      expect(result.current.attendeePages).toEqual([])

      await waitFor(() => expect(result.current.status).toEqual("success"))

      expect(fetchNextAttendeesPage).toHaveBeenCalledWith(11, 15, undefined)
      expect(fetchNextAttendeesPage).toHaveBeenCalledTimes(1)
      expect(result.current.host).toEqual(EventAttendeeMocks.Alivs)
      expect(result.current.attendeePages).toEqual([
        [EventAttendeeMocks.AnnaAttendee]
      ])
      expect(result.current.attendeeCount).toEqual(2)
    })
    it("loads multiple pages correctly", async () => {
      const mockData = {
        attendees: [EventAttendeeMocks.Alivs, EventAttendeeMocks.AnnaAttendee],
        attendeeCount: 2,
        nextPageKey: "2"
      }
      const mockData2 = {
        attendees: [EventAttendeeMocks.BlobJr, EventAttendeeMocks.BlobSr],
        attendeeCount: 10,
        nextPageKey: undefined
      }
      fetchNextAttendeesPage.mockResolvedValueOnce(mockData)
      const { result } = renderUseAttendeesList(11, 15)

      expect(result.current.status).toEqual("loading")
      await waitFor(() => expect(result.current.status).toEqual("success"))

      fetchNextAttendeesPage.mockResolvedValueOnce(mockData2)
      act(() => result.current.fetchNextGroup?.())
      await waitFor(() => expect(result.current.status).toEqual("success"))

      expect(fetchNextAttendeesPage).toHaveBeenNthCalledWith(2, 11, 15, "2")
      expect(fetchNextAttendeesPage).toHaveBeenCalledTimes(2)

      await waitFor(() =>
        expect(result.current.attendeePages).toEqual([
          [EventAttendeeMocks.AnnaAttendee],
          [EventAttendeeMocks.BlobJr, EventAttendeeMocks.BlobSr]
        ])
      )
      expect(result.current.host).toEqual(EventAttendeeMocks.Alivs)
      expect(result.current.fetchNextGroup).toBeUndefined()
      expect(result.current.attendeeCount).toEqual(10)
    })
    test("the hook returns an error if fetchPage function fails to give results", async () => {
      fetchNextAttendeesPage.mockRejectedValueOnce(
        new Error("failed to receive data")
      )
      const { result } = renderUseAttendeesList(11, 15)
      expect(result.current.status).toEqual("loading")

      await waitFor(() => expect(result.current.status).toEqual("error"))
      expect(result.current.error?.message).toEqual("failed to receive data")
      expect(fetchNextAttendeesPage).toHaveBeenCalledWith(11, 15, undefined)
      expect(fetchNextAttendeesPage).toHaveBeenCalledTimes(1)
    })
  })
})
