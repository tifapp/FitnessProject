import { TiFAPI } from "@api-client/TiFAPI"
import { UserHandle } from "@content-parsing"
import { dateRange } from "@date-time"
import { InternetConnectionStatusProvider } from "@lib/InternetConnection"
import { ColorString } from "@lib/utils/Color"
import { uuidString } from "@lib/utils/UUID"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import { TestInternetConnectionStatus } from "@test-helpers/InternetConnectionStatus"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { withAnimatedTimeTravelEnabled } from "@test-helpers/Timers"
import { mswServer } from "@test-helpers/msw"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import dayjs from "dayjs"
import { HttpResponse, http } from "msw"
import { loadEventDetails, useLoadEventDetails } from "./EventDetailsLoading"
import { EventMocks, mockEventLocation } from "./MockData"

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

    test("load successfully, refresh returns \"not-found\" flow", async () => {
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

    test("load failure with bad internet, retries successfully when internet comes back online", async () => {
      testConnectionStatus.publishIsConnected(false)
      loadEvent.mockRejectedValueOnce(new Error()).mockResolvedValueOnce({
        status: "success",
        event: EventMocks.Multiday
      })
      const { result } = renderUseLoadEvent(1)
      await waitFor(() => expect(result.current.status).toEqual("error"))
      expect((result.current as any).isConnectedToInternet).toEqual(false)
      act(() => testConnectionStatus.publishIsConnected(true))
      await waitFor(() => expect(result.current.status).toEqual("success"))
      expect(result.current).toMatchObject({
        event: EventMocks.Multiday,
        refreshStatus: "idle"
      })
      expect(loadEvent).toHaveBeenNthCalledWith(2, 1)
      expect(loadEvent).toHaveBeenCalledTimes(2)
    })

    it("should only retry on internet coming back up only when in an error state", async () => {
      loadEvent
        .mockResolvedValueOnce({
          status: "success",
          event: EventMocks.Multiday
        })
        .mockRejectedValueOnce(new Error())
      const { result } = renderUseLoadEvent(1)
      await waitFor(() => expect(result.current.status).toEqual("success"))
      act(() => testConnectionStatus.publishIsConnected(false))
      act(() => testConnectionStatus.publishIsConnected(true))
      await verifyNeverOccurs(() => {
        expect((result.current as any).refreshStatus).toEqual("error")
      })
      expect(loadEvent).toHaveBeenCalledTimes(1)
    })

    const renderUseLoadEvent = (eventId: number) => {
      return renderHook(
        (eventId: number) => useLoadEventDetails(eventId, loadEvent),
        {
          initialProps: eventId,
          wrapper: ({ children }: any) => (
            <InternetConnectionStatusProvider status={testConnectionStatus}>
              <TestQueryClientProvider>{children}</TestQueryClientProvider>
            </InternetConnectionStatusProvider>
          )
        }
      )
    }
  })

  describe("LoadEventDetails tests", () => {
    withAnimatedTimeTravelEnabled()

    it("should return \"canceled\" when a 204 occurs", async () => {
      setEventResponse(204)
      const result = await loadEventDetails(1, TiFAPI.testAuthenticatedInstance)
      expect(result).toEqual({ status: "cancelled" })
    })

    it("should return \"not-found\" when a 404 occurs", async () => {
      setEventResponse(404, { error: "event-not-found" })
      const result = await loadEventDetails(1, TiFAPI.testAuthenticatedInstance)
      expect(result).toEqual({ status: "not-found" })
    })

    it("should return \"blocked\" when a 403 occurs", async () => {
      const blockedEventResponse = {
        id: 1,
        title: "Some Event",
        createdAt: new Date(),
        updatedAt: new Date(),
        host: {
          id: uuidString(),
          username: "Blob",
          handle: "blob",
          profileImageURL: null,
          relations: {
            themToYou: "blocked",
            youToThem: "blocked"
          }
        }
      }
      setEventResponse(403, blockedEventResponse)
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
      const eventResponse = {
        id: 1,
        title: "Some Event",
        color: "#FFFFFF",
        description: "This is an event.",
        hasArrived: false,
        createdAt: new Date(2000),
        updatedAt: new Date(3000),
        attendeeCount: 10,
        userAttendeeStatus: "attending",
        isChatExpired: false,
        host: {
          id: uuidString(),
          username: "Blob",
          handle: "blob",
          profileImageURL: null,
          relations: {
            themToYou: "not-friends",
            youToThem: "not-friends"
          }
        },
        settings: {
          shouldHideAfterStartDate: false,
          isChatEnabled: true
        },
        time: {
          secondsToStart: dayjs.duration(3, "hours").asSeconds(),
          todayOrTomorrow: "today",
          dateRange: {
            startDateTime: new Date(4000),
            endDateTime: new Date(5000)
          }
        },
        joinDate: null,
        location: mockEventLocation(),
        previewAttendees: [{ id: uuidString(), profileImageURL: null }],
        hasEndedEarly: false
      }
      setEventResponse(200, eventResponse)
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
            dateRange: dateRange(new Date(4000), new Date(5000)),
            clientReceivedTime
          }
        }
      })
    })

    const setEventResponse = (
      statusCode: 200 | 204 | 404 | 403,
      body?: object
    ) => {
      mswServer.use(
        http.get(TiFAPI.testPath("/event/details/:id"), async ({ request }) => {
          if (statusCode === 204) {
            return new HttpResponse(null, {
              status: 204
            })
          }
          return new HttpResponse(JSON.stringify(body), {
            status: statusCode,
            headers: {
              "Content-Type": "application/json"
            }
          })
        })
      )
    }
  })
})
