import { uuidString } from "@lib/utils/UUID"
import { TestInternetConnectionStatus } from "@test-helpers/InternetConnectionStatus"
import { fakeTimers } from "@test-helpers/Timers"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { TiFAPI } from "TiFShared/api"
import { EventResponse } from "TiFShared/api/models/Event"
import { ColorString } from "TiFShared/domain-models/ColorString"
import { EventID, EventWhenBlockedByHost } from "TiFShared/domain-models/Event"
import { dateRange } from "TiFShared/domain-models/FixedDateRange"
import { UserHandle } from "TiFShared/domain-models/User"
import { mockTiFEndpoint } from "TiFShared/test-helpers/mockAPIServer"
import dayjs from "dayjs"
import {
  loadEventDetails,
  useDisplayedEventDetailsLoadingBalls
} from "./Details"
import { EventMocks, mockEventLocation } from "./MockData"
import { renderUseLoadEventDetails } from "./TestHelpers"

describe("EventDetailsLoading tests", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe("UseLoadEventDetails tests", () => {
    const loadEvent = jest.fn()
    let testConnectionStatus = new TestInternetConnectionStatus(true)

    beforeEach(() => {
      testConnectionStatus = new TestInternetConnectionStatus(true)
    })

    test("basic loading flow", async () => {
      loadEvent.mockResolvedValueOnce({
        status: "success",
        event: EventMocks.Multiday
      })
      const { result } = renderUseLoadEvent(1)
      expect(result.current).toEqual({ status: "loading" })
      await waitFor(() => expect(result.current.status).toEqual("success"))
      expect(result.current).toMatchObject({
        event: EventMocks.Multiday,
        refreshStatus: "idle"
      })
      expect(loadEvent).toHaveBeenCalledWith(1)
      expect(loadEvent).toHaveBeenCalledTimes(1)
    })

    test("basic error loading flow", async () => {
      loadEvent.mockRejectedValueOnce(new Error())
      const { result } = renderUseLoadEvent(1)
      expect(result.current).toEqual({ status: "loading" })
      await waitFor(() => expect(result.current.status).toEqual("error"))
      expect(loadEvent).toHaveBeenCalledWith(1)
      expect(loadEvent).toHaveBeenCalledTimes(1)
    })

    test("test blocked loading flow", async () => {
      const blockedEvent = {
        id: 1,
        title: EventMocks.Multiday.title,
        host: EventMocks.Multiday.host
      }
      loadEvent.mockResolvedValueOnce({
        status: "blocked",
        event: blockedEvent
      })
      const { result } = renderUseLoadEvent(1)
      expect(result.current).toEqual({ status: "loading" })
      await waitFor(() => {
        expect(result.current).toEqual({
          status: "blocked",
          event: blockedEvent
        })
      })
      expect(loadEvent).toHaveBeenCalledWith(1)
      expect(loadEvent).toHaveBeenCalledTimes(1)
    })

    test("test not-found flow", async () => {
      loadEvent.mockResolvedValueOnce({ status: "not-found" })
      const { result } = renderUseLoadEvent(1)
      expect(result.current).toEqual({ status: "loading" })
      await waitFor(() => {
        expect(result.current).toEqual({ status: "not-found" })
      })
      expect(loadEvent).toHaveBeenCalledWith(1)
      expect(loadEvent).toHaveBeenCalledTimes(1)
    })

    test("test cancelled flow", async () => {
      loadEvent.mockResolvedValueOnce({ status: "cancelled" })
      const { result } = renderUseLoadEvent(1)
      expect(result.current).toEqual({ status: "loading" })
      await waitFor(() =>
        expect(result.current).toEqual({ status: "cancelled" })
      )
      expect(loadEvent).toHaveBeenCalledWith(1)
      expect(loadEvent).toHaveBeenCalledTimes(1)
    })

    test("load successfully, then refresh to error flow", async () => {
      let resolveRefresh: (() => void) | undefined
      const refreshPromise = new Promise<void>(
        (resolve) => (resolveRefresh = resolve)
      )
      loadEvent
        .mockResolvedValueOnce({
          status: "success",
          event: EventMocks.Multiday
        })
        .mockImplementationOnce(async () => {
          await refreshPromise
          throw new Error()
        })
      const { result } = renderUseLoadEvent(1)
      expect(result.current).toEqual({ status: "loading" })
      await waitFor(() => expect(result.current.status).toEqual("success"))
      act(() => (result.current as any).refresh())
      await waitFor(() => {
        expect((result.current as any).refreshStatus).toEqual("loading")
      })
      expect(result.current).toMatchObject({
        status: "success",
        event: EventMocks.Multiday
      })
      act(() => resolveRefresh?.())
      await waitFor(() => {
        expect((result.current as any).refreshStatus).toEqual("error")
      })
      expect(result.current).toMatchObject({
        status: "success",
        event: EventMocks.Multiday
      })
      expect(loadEvent).toHaveBeenNthCalledWith(2, 1)
      expect(loadEvent).toHaveBeenCalledTimes(2)
    })

    test("load successfully, refresh returns not-found flow", async () => {
      loadEvent
        .mockResolvedValueOnce({
          status: "success",
          event: EventMocks.Multiday
        })
        .mockResolvedValueOnce({ status: "not-found" })
      const { result } = renderUseLoadEvent(1)
      expect(result.current).toEqual({ status: "loading" })
      await waitFor(() => expect(result.current.status).toEqual("success"))
      act(() => (result.current as any).refresh())
      await waitFor(() => {
        expect(result.current.status).toEqual("not-found")
      })
      expect(loadEvent).toHaveBeenNthCalledWith(2, 1)
      expect(loadEvent).toHaveBeenCalledTimes(2)
    })

    test("load failure, then retry successfully", async () => {
      let resolveRetry: (() => void) | undefined
      const retryPromise = new Promise<void>(
        (resolve) => (resolveRetry = resolve)
      )
      loadEvent
        .mockRejectedValueOnce(new Error())
        .mockImplementationOnce(async () => {
          await retryPromise
          return {
            status: "success",
            event: EventMocks.Multiday
          }
        })
      const { result } = renderUseLoadEvent(1)
      expect(result.current).toEqual({ status: "loading" })
      await waitFor(() => expect(result.current.status).toEqual("error"))
      expect((result.current as any).isConnectedToInternet).toEqual(true)
      act(() => (result.current as any).retry())
      await waitFor(() => expect(result.current.status).toEqual("loading"))
      act(() => resolveRetry?.())
      await waitFor(() => expect(result.current.status).toEqual("success"))
      expect(result.current).toMatchObject({
        event: EventMocks.Multiday,
        refreshStatus: "idle"
      })
      expect(loadEvent).toHaveBeenNthCalledWith(2, 1)
      expect(loadEvent).toHaveBeenCalledTimes(2)
    })

    const renderUseLoadEvent = (eventId: EventID) => {
      return renderUseLoadEventDetails(eventId, testConnectionStatus, loadEvent)
    }
  })

  describe("LoadEventDetails tests", () => {
    fakeTimers()

    it("should return not-found when a 404 occurs", async () => {
      mockTiFEndpoint("eventDetails", 404, { error: "event-not-found" })
      const result = await loadEventDetails(1, TiFAPI.testAuthenticatedInstance)
      expect(result).toEqual({ status: "not-found" })
    })

    it("should return blocked when a 403 occurs", async () => {
      const blockedEventResponse: EventWhenBlockedByHost = {
        error: "blocked-you",
        id: 1,
        title: "Some Event",
        createdDateTime: new Date(),
        updatedDateTime: new Date(),
        host: {
          id: uuidString(),
          name: "Blob",
          handle: UserHandle.optionalParse("blob")!,
          relationStatus: "blocked-you"
        }
      }
      mockTiFEndpoint("eventDetails", 403, blockedEventResponse)
      const result = await loadEventDetails(1, TiFAPI.testAuthenticatedInstance)
      expect(result).toEqual({
        status: "blocked",
        event: {
          ...blockedEventResponse,
          host: {
            ...blockedEventResponse.host,
            handle: UserHandle.optionalParse("blob")!
          }
        }
      })
    })

    it("should indicate the time of response on the event time when a 200 occurs", async () => {
      const clientReceivedTime = new Date(4500)
      jest.setSystemTime(clientReceivedTime)
      const eventResponse = EventMocks.MockSingleAttendeeResponse
      mockTiFEndpoint("eventDetails", 200, eventResponse)
      const resp = await loadEventDetails(1, TiFAPI.testAuthenticatedInstance)
      expect(resp).toEqual({
        status: "success",
        event: {
          ...eventResponse,
          color: ColorString.parse("#FFFFFF")!,
          host: {
            ...eventResponse.host,
            handle: UserHandle.optionalParse("blob")!
          },
          time: {
            ...eventResponse.time,
            clientReceivedTime
          }
        }
      })
    })
  })

  describe("UseDisplayedEventDetailsLoadingBalls tests", () => {
    fakeTimers()

    test("appearance cycle", async () => {
      const { result } = renderUseDisplayedEventDetailsLoadingBalls()
      const assert = async (one: boolean, two: boolean, three: boolean) => {
        await waitFor(() => expect(result.current).toEqual([one, two, three]))
      }

      await assert(false, false, false)
      act(() => jest.advanceTimersByTime(100))
      await assert(false, false, false)
      act(() => jest.advanceTimersByTime(400))
      await assert(true, false, false)
      act(() => jest.advanceTimersByTime(500))
      await assert(true, true, false)
      act(() => jest.advanceTimersByTime(500))
      await assert(true, true, true)
      act(() => jest.advanceTimersByTime(500))
      await assert(false, false, false)
      act(() => jest.advanceTimersByTime(500))
      await assert(true, false, false)
    })

    const renderUseDisplayedEventDetailsLoadingBalls = () => {
      return renderHook(useDisplayedEventDetailsLoadingBalls, {
        initialProps: 500
      })
    }
  })
})
