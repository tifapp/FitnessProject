import { act, renderHook, waitFor } from "@testing-library/react-native"
import { useLoadEventDetails } from "./EventDetailsLoading"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { EventMocks } from "./MockData"
import { TestInternetConnectionStatus } from "@test-helpers/InternetConnectionStatus"
import { InternetConnectionStatusProvider } from "@lib/InternetConnection"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"

describe("EventDetailsLoading tests", () => {
  const loadEvent = jest.fn()
  let testConnectionStatus = new TestInternetConnectionStatus(true)

  beforeEach(() => {
    jest.resetAllMocks()
    testConnectionStatus = new TestInternetConnectionStatus(true)
  })

  describe("UseLoadEventDetails tests", () => {
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

    test("test deleted flow", async () => {
      loadEvent.mockResolvedValueOnce({ status: "deleted" })
      const { result } = renderUseLoadEvent(1)
      expect(result.current).toEqual({ status: "loading" })
      await waitFor(() => expect(result.current).toEqual({ status: "deleted" }))
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
})
