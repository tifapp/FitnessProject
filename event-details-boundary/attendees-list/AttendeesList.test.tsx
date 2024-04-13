import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { EventAttendeeMocks } from "../MockData"
import { EventAttendeesPage, useAttendeesList } from "./AttendeesList"
import { EventAttendeesList } from "./EventAttendeesList"

describe("AttendeesList tests", () => {
  beforeEach(() => jest.resetAllMocks())

  const fetchNextAttendeesPage = jest.fn()

  const renderUseAttendeesList = (eventId: number, pageSize: number) => {
    return renderHook(
      () => useAttendeesList({ fetchNextAttendeesPage, eventId, pageSize }),
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
        totalAttendeeCount: 2,
        nextPageCursor: null
      }
      fetchNextAttendeesPage.mockResolvedValueOnce(mockData)
      const { result } = renderUseAttendeesList(11, 15)

      expect(result.current.status).toEqual("loading")

      await waitFor(() => expect(result.current.status).toEqual("success"))

      expect(fetchNextAttendeesPage).toHaveBeenCalledWith(11, 15, undefined)
      expect(fetchNextAttendeesPage).toHaveBeenCalledTimes(1)
      expect(result.current).toMatchObject({
        attendeesList: new EventAttendeesList([mockData])
      })
    })
    it("loads multiple pages correctly", async () => {
      const mockData = {
        attendees: [EventAttendeeMocks.Alivs, EventAttendeeMocks.AnnaAttendee],
        totalAttendeeCount: 2,
        nextPageCursor: "2"
      }
      const mockData2 = {
        attendees: [EventAttendeeMocks.BlobJr, EventAttendeeMocks.BlobSr],
        totalAttendeeCount: 10,
        nextPageCursor: null
      }

      fetchNextAttendeesPage.mockResolvedValueOnce(mockData)
      const { result } = renderUseAttendeesList(11, 15)

      expect(result.current.status).toEqual("loading")
      await waitFor(() => expect(result.current.status).toEqual("success"))

      let resolveFetch: ((page: EventAttendeesPage) => void) | undefined
      const fetchPromise = new Promise<EventAttendeesPage>(
        (resolve) => (resolveFetch = resolve)
      )
      fetchNextAttendeesPage.mockReturnValueOnce(fetchPromise)
      act(() => (result.current as any).fetchNextGroup())

      await waitFor(() =>
        expect(result.current).toMatchObject({ isFetchingNextPage: true })
      )
      act(() => resolveFetch?.(mockData2))
      await waitFor(() =>
        expect(result.current).toMatchObject({ isFetchingNextPage: false })
      )

      expect(fetchNextAttendeesPage).toHaveBeenNthCalledWith(2, 11, 15, "2")
      expect(fetchNextAttendeesPage).toHaveBeenCalledTimes(2)
      await waitFor(() =>
        expect(result.current).toMatchObject({
          attendeesList: new EventAttendeesList([mockData, mockData2]),
          fetchNextGroup: undefined
        })
      )
    })
    test("the hook returns an error and allows refetching, if initial fetchPage function fails to give results", async () => {
      const mockData = {
        attendees: [EventAttendeeMocks.Alivs, EventAttendeeMocks.AnnaAttendee],
        totalAttendeeCount: 2,
        nextPageCursor: "2"
      }
      fetchNextAttendeesPage.mockRejectedValueOnce(
        new Error("failed to receive data")
      )
      fetchNextAttendeesPage.mockResolvedValueOnce(mockData)

      const { result } = renderUseAttendeesList(11, 15)
      expect(result.current.status).toEqual("loading")

      await waitFor(() => expect(result.current.status).toEqual("error"))
      expect(fetchNextAttendeesPage).toHaveBeenCalledWith(11, 15, undefined)
      act(() => (result.current as any).refresh())

      expect(fetchNextAttendeesPage).toHaveBeenCalledWith(11, 15, undefined)
      expect(fetchNextAttendeesPage).toHaveBeenCalledTimes(2)
      await waitFor(() => expect(result.current.status).toEqual("success"))

      await waitFor(() =>
        expect(result.current).toMatchObject({
          attendeesList: new EventAttendeesList([mockData])
        })
      )
    })
    test("pull to refresh flow", async () => {
      const mockData = {
        attendees: [EventAttendeeMocks.Alivs, EventAttendeeMocks.AnnaAttendee],
        totalAttendeeCount: 2,
        nextPageCursor: "2"
      }
      const mockData2 = {
        attendees: [EventAttendeeMocks.BlobJr, EventAttendeeMocks.BlobSr],
        totalAttendeeCount: 10,
        nextPageCursor: null
      }
      fetchNextAttendeesPage.mockResolvedValueOnce(mockData)
      const { result } = renderUseAttendeesList(11, 15)
      await waitFor(() => expect(result.current.status).toEqual("success"))

      expect(result.current).toMatchObject({
        attendeesList: new EventAttendeesList([mockData])
      })
      let resolveFetch: ((page: EventAttendeesPage) => void) | undefined
      const fetchPromise = new Promise<EventAttendeesPage>(
        (resolve) => (resolveFetch = resolve)
      )
      fetchNextAttendeesPage.mockReturnValueOnce(fetchPromise)

      act(() => (result.current as any).refresh())

      await waitFor(() =>
        expect(result.current).toMatchObject({ isRefetching: true })
      )
      act(() => resolveFetch?.(mockData2))
      await waitFor(() =>
        expect(result.current).toMatchObject({ isRefetching: false })
      )
      expect(fetchNextAttendeesPage).toHaveBeenCalledWith(11, 15, undefined)
      expect(fetchNextAttendeesPage).toHaveBeenCalledTimes(2)

      expect(result.current).toMatchObject({
        attendeesList: new EventAttendeesList([mockData2]),
        fetchNextGroup: undefined
      })
    })
  })
})
