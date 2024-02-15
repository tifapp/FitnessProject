import { mockLocationCoordinate2D } from "@location/MockData"
import { captureAlerts } from "@test-helpers/Alerts"
import "@test-helpers/Matchers"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { withAnimatedTimeTravelEnabled } from "@test-helpers/Timers"
import { renderHook, waitFor } from "@testing-library/react-native"
import { act } from "react-test-renderer"
import {
  JOIN_EVENT_ERROR_ALERTS,
  JoinEventResult,
  useJoinEventStages
} from "./JoinEvent"
import { TrueRegionMonitor } from "./arrival-tracking/region-monitoring/MockRegionMonitors"

describe("JoinEvent tests", () => {
  const env = {
    joinEvent: jest.fn(),
    monitor: TrueRegionMonitor,
    onSuccess: jest.fn(),
    loadPermissions: jest.fn()
  }

  const TEST_EVENT = {
    id: 1,
    location: {
      coordinate: mockLocationCoordinate2D(),
      arrivalRadiusMeters: 50,
      isInArrivalTrackingPeriod: true
    }
  }
  beforeEach(() => jest.resetAllMocks())

  afterEach(async () => {
    // resolve "Warning: An update to ForwardRef inside a test was not wrapped in act(...)."
    await act(async () => {
      await Promise.resolve()
    })
  })
  withAnimatedTimeTravelEnabled()

  describe("useJoinEvent tests", () => {
    beforeEach(() => jest.resetAllMocks())

    afterEach(async () => {
      // resolve "Warning: An update to ForwardRef inside a test was not wrapped in act(...)."
      await act(async () => {
        await Promise.resolve()
      })
    })
    withAnimatedTimeTravelEnabled()
    const { alertPresentationSpy } = captureAlerts()

    test("join event flow, all permissions requested", async () => {
      env.loadPermissions.mockResolvedValueOnce([
        {
          id: "notifications",
          canRequestPermission: true,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        },
        {
          id: "backgroundLocation",
          canRequestPermission: true,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        }
      ])
      let resolveJoin: ((result: JoinEventResult) => void) | undefined
      const joinPromise = new Promise<JoinEventResult>(
        (resolve) => (resolveJoin = resolve)
      )
      env.joinEvent.mockReturnValueOnce(joinPromise)
      const { result } = renderUseJoinEvent()
      await waitFor(() => expect(result.current).toEqual({
        id: "idle",
        joinButtonTapped: expect.any(Function)
      }))

      act(() => (result.current as any).joinButtonTapped())
      await waitFor(() => expect(result.current.id).toEqual("loading"))
      act(() => resolveJoin?.("success"))
      await waitFor(() => {
        expect(result.current).toMatchObject({
          id: "permission",
          permissionId: "notifications"
        })
      })
      await waitFor(() => expect(env.joinEvent).toHaveBeenCalledWith({
        ...TEST_EVENT,
        hasArrived: true
      }))

      act(() => (result.current as any).requestButtonTapped())
      await waitFor(() => {
        expect(result.current).toMatchObject({
          id: "permission",
          permissionId: "backgroundLocation"
        })
      })

      await waitFor(() => expect(env.onSuccess).not.toHaveBeenCalled())
      act(() => (result.current as any).requestButtonTapped())
      await waitFor(() => expect(result.current).toEqual({ id: "success" }))
      await waitFor(() => expect(env.onSuccess).toHaveBeenCalledTimes(1))
    })

    test("join event flow, skips false permissions", async () => {
      env.loadPermissions.mockResolvedValueOnce([
        {
          id: "notifications",
          canRequestPermission: false,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        },
        {
          id: "backgroundLocation",
          canRequestPermission: true,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        }
      ])
      env.joinEvent.mockResolvedValueOnce("success")
      const { result } = renderUseJoinEvent()

      act(() => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(result.current).toMatchObject({
          id: "permission",
          permissionId: "backgroundLocation"
        })
      })
    })

    test("join event flow, no permissions requested", async () => {
      env.loadPermissions.mockResolvedValueOnce([
        {
          id: "notifications",
          canRequestPermission: false,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        },
        {
          id: "backgroundLocation",
          canRequestPermission: false,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        }
      ])
      env.joinEvent.mockResolvedValueOnce("success")
      const { result } = renderUseJoinEvent()

      act(() => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(result.current).toEqual({ id: "success" })
      })
      await waitFor(() => expect(env.onSuccess).toHaveBeenCalledTimes(1))
    })

    test("join event flow, dismiss permissions", async () => {
      env.loadPermissions.mockResolvedValueOnce([
        {
          id: "notifications",
          canRequestPermission: true,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        },
        {
          id: "backgroundLocation",
          canRequestPermission: true,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        }
      ])
      env.joinEvent.mockResolvedValueOnce("success")
      const { result } = renderUseJoinEvent()

      act(() => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(result.current).toMatchObject({
          id: "permission",
          permissionId: "notifications"
        })
      })

      act(() => (result.current as any).dismissButtonTapped())
      await waitFor(() => expect(result.current).toMatchObject({
        id: "permission",
        permissionId: "backgroundLocation"
      }))

      await waitFor(() => expect(env.onSuccess).not.toHaveBeenCalled())
      act(() => (result.current as any).dismissButtonTapped())
      await waitFor(() => { expect(result.current).toEqual({ id: "success" }) })
      await waitFor(() => expect(env.onSuccess).toHaveBeenCalledTimes(1))
    })

    test("join event flow, error alerts", async () => {
      env.loadPermissions.mockResolvedValueOnce([])
      const { result } = renderUseJoinEvent()

      env.joinEvent.mockResolvedValueOnce("eventHasEnded")
      await expectErrorAlertState(result, 1, "eventHasEnded")

      env.joinEvent.mockResolvedValueOnce("eventWasCancelled")
      await expectErrorAlertState(result, 2, "eventWasCancelled")

      env.joinEvent.mockRejectedValueOnce(new Error())
      await expectErrorAlertState(result, 3, "generic")
    })

    const expectErrorAlertState = async (
      result: { current: ReturnType<typeof useJoinEventStages> },
      callIndex: number,
      key: keyof typeof JOIN_EVENT_ERROR_ALERTS
    ) => {
      act(() => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenNthCalledWith(
          callIndex,
          JOIN_EVENT_ERROR_ALERTS[key].title,
          JOIN_EVENT_ERROR_ALERTS[key].description
        )
      })
      await waitFor(() => {
        expect(result.current).toEqual({
          id: "idle",
          joinButtonTapped: expect.any(Function)
        })
      })
    }

    const renderUseJoinEvent = () => {
      return renderHook(() => useJoinEventStages(TEST_EVENT, env), {
        wrapper: ({ children }: any) => (
          <TestQueryClientProvider>{children}</TestQueryClientProvider>
        )
      })
    }
  })
})
