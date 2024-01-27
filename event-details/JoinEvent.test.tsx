import { captureAlerts } from "@test-helpers/Alerts"
import {
  JOIN_EVENT_ERROR_ALERTS,
  JoinEventResult,
  useJoinEvent
} from "./JoinEvent"
import { renderHook, waitFor } from "@testing-library/react-native"
import { act } from "react-test-renderer"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { mockLocationCoordinate2D } from "@location/MockData"

describe("JoinEvent tests", () => {
  describe("useJoinEvent tests", () => {
    const { alertPresentationSpy } = captureAlerts()
    const env = {
      joinEvent: jest.fn(),
      monitor: {
        monitorRegion: () => jest.fn(),
        hasArrivedAtRegion: () => true
      },
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

    test("join event flow, all permissions requested", async () => {
      env.loadPermissions.mockResolvedValueOnce([
        {
          id: "1",
          canRequestPermission: true,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        },
        {
          id: "2",
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
      expect(result.current).toEqual({
        status: "idle",
        joinButtonTapped: expect.any(Function)
      })

      act(() => (result.current as any).joinButtonTapped())
      await waitFor(() => expect(result.current.status).toEqual("loading"))
      act(() => resolveJoin?.("success"))
      await waitFor(() => {
        expect(result.current).toMatchObject({
          status: "permission",
          permissionId: "1"
        })
      })
      expect(env.joinEvent).toHaveBeenCalledWith({
        ...TEST_EVENT,
        hasArrived: true
      })

      act(() => (result.current as any).requestButtonTapped())
      await waitFor(() => {
        expect(result.current).toMatchObject({
          status: "permission",
          permissionId: "2"
        })
      })

      expect(env.onSuccess).not.toHaveBeenCalled()
      act(() => (result.current as any).requestButtonTapped())
      await waitFor(() => expect(result.current).toEqual({ status: "success" }))
      expect(env.onSuccess).toHaveBeenCalledTimes(1)
    })

    test("join event flow, skips false permissions", async () => {
      env.loadPermissions.mockResolvedValueOnce([
        {
          id: "1",
          canRequestPermission: false,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        },
        {
          id: "2",
          canRequestPermission: true,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        }
      ])
      env.joinEvent.mockResolvedValueOnce("success")
      const { result } = renderUseJoinEvent()

      act(() => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(result.current).toMatchObject({
          status: "permission",
          permissionId: "2"
        })
      })
    })

    test("join event flow, no permissions requested", async () => {
      env.loadPermissions.mockResolvedValueOnce([
        {
          id: "1",
          canRequestPermission: false,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        },
        {
          id: "2",
          canRequestPermission: false,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        }
      ])
      env.joinEvent.mockResolvedValueOnce("success")
      const { result } = renderUseJoinEvent()

      act(() => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(result.current).toEqual({ status: "success" })
      })
      expect(env.onSuccess).toHaveBeenCalledTimes(1)
    })

    test("join event flow, dismiss permissions", async () => {
      env.loadPermissions.mockResolvedValueOnce([
        {
          id: "1",
          canRequestPermission: true,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        },
        {
          id: "2",
          canRequestPermission: true,
          requestPermission: jest.fn().mockResolvedValueOnce(true)
        }
      ])
      env.joinEvent.mockResolvedValueOnce("success")
      const { result } = renderUseJoinEvent()

      act(() => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(result.current).toMatchObject({
          status: "permission",
          permissionId: "1"
        })
      })

      act(() => (result.current as any).dismissButtonTapped())
      expect(result.current).toMatchObject({
        status: "permission",
        permissionId: "2"
      })

      expect(env.onSuccess).not.toHaveBeenCalled()
      act(() => (result.current as any).dismissButtonTapped())
      expect(result.current).toEqual({ status: "success" })
      expect(env.onSuccess).toHaveBeenCalledTimes(1)
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
      result: { current: ReturnType<typeof useJoinEvent> },
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
      expect(result.current).toEqual({
        status: "idle",
        joinButtonTapped: expect.any(Function)
      })
    }

    const renderUseJoinEvent = () => {
      return renderHook(() => useJoinEvent(TEST_EVENT, env), {
        wrapper: ({ children }: any) => (
          <TestQueryClientProvider>{children}</TestQueryClientProvider>
        )
      })
    }
  })
})
