import { captureAlerts } from "@test-helpers/Alerts"
import {
  JOIN_EVENT_ERROR_ALERTS,
  JoinEventRequest,
  JoinEventResult,
  joinEvent,
  saveRecentLocationJoinEventHandler,
  useJoinEventStages
} from "./JoinEvent"
import { renderHook, waitFor } from "@testing-library/react-native"
import { act } from "react-test-renderer"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "@test-helpers/ReactQuery"
import { mockLocationCoordinate2D, mockTiFLocation } from "@location/MockData"
import "@test-helpers/Matchers"
import { TrueRegionMonitor } from "@arrival-tracking/region-monitoring/MockRegionMonitors"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { SQLiteRecentLocationsStorage } from "@lib/RecentsLocations"
import { mswServer } from "@test-helpers/msw"
import { http, HttpResponse } from "msw"
import { TiFAPI } from "@api-client/TiFAPI"
import { mockEventRegion } from "@arrival-tracking/MockData"
import {
  EventMocks,
  mockEventChatTokenRequest,
  mockEventLocation
} from "./MockData"
import { renderSuccessfulUseLoadEventDetails } from "./TestHelpers"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"

describe("JoinEvent tests", () => {
  describe("UseJoinEvent tests", () => {
    const { alertPresentationSpy } = captureAlerts()
    const queryClient = createTestQueryClient()

    const env = {
      joinEvent: jest.fn(),
      monitor: TrueRegionMonitor,
      loadPermissions: jest.fn()
    }

    const TEST_EVENT = {
      ...EventMocks.PickupBasketball,
      id: 1,
      location: mockEventLocation(),
      userAttendeeStatus: "not-participating"
    } as const

    const NON_REQUESTABLE_PERMISSIONS = [
      {
        kind: "notifications",
        canRequestPermission: false,
        requestPermission: jest.fn().mockResolvedValueOnce(true)
      },
      {
        kind: "backgroundLocation",
        canRequestPermission: false,
        requestPermission: jest.fn().mockResolvedValueOnce(true)
      }
    ] as const

    const REQUESTABLE_PERMISSIONS = NON_REQUESTABLE_PERMISSIONS.map((p) => ({
      ...p,
      canRequestPermission: true
    }))

    beforeEach(() => {
      Object.values(env).forEach((m) => "mockReset" in m && m.mockReset())
      queryClient.clear()
    })

    test("join event flow, all permissions requested", async () => {
      env.loadPermissions.mockResolvedValueOnce(REQUESTABLE_PERMISSIONS)
      let resolveJoin: ((result: JoinEventResult) => void) | undefined
      const joinPromise = new Promise<JoinEventResult>(
        (resolve) => (resolveJoin = resolve)
      )
      env.joinEvent.mockReturnValueOnce(joinPromise)
      const { result } = renderUseJoinEvent()
      expect(result.current).toEqual({
        stage: "idle",
        joinButtonTapped: expect.any(Function)
      })

      act(() => (result.current as any).joinButtonTapped())
      await waitFor(() => expect(result.current.stage).toEqual("loading"))
      act(() => resolveJoin?.("success"))
      await waitFor(() => {
        expect(result.current).toMatchObject({
          stage: "permission",
          permissionKind: "notifications"
        })
      })
      expect(env.joinEvent).toHaveBeenCalledWith({
        ...TEST_EVENT,
        hasArrived: true
      })

      act(() => (result.current as any).requestButtonTapped())
      await waitFor(() => {
        expect(result.current).toMatchObject({
          stage: "permission",
          permissionKind: "backgroundLocation"
        })
      })

      act(() => (result.current as any).requestButtonTapped())
      await waitFor(() => expect(result.current).toEqual({ stage: "success" }))
    })

    test("join event flow, skips false permissions", async () => {
      env.loadPermissions.mockResolvedValueOnce([
        NON_REQUESTABLE_PERMISSIONS[0],
        { ...NON_REQUESTABLE_PERMISSIONS[1], canRequestPermission: true }
      ])
      env.joinEvent.mockResolvedValueOnce("success")
      const { result } = renderUseJoinEvent()

      act(() => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(result.current).toMatchObject({
          stage: "permission",
          permissionKind: "backgroundLocation"
        })
      })
    })

    test("join event flow, no permissions requested", async () => {
      env.loadPermissions.mockResolvedValueOnce(NON_REQUESTABLE_PERMISSIONS)
      env.joinEvent.mockResolvedValueOnce("success")
      const { result } = renderUseJoinEvent()

      act(() => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(result.current).toEqual({ stage: "success" })
      })
    })

    test("join event flow, dismiss permissions", async () => {
      env.loadPermissions.mockResolvedValueOnce(REQUESTABLE_PERMISSIONS)
      env.joinEvent.mockResolvedValueOnce("success")
      const { result } = renderUseJoinEvent()

      act(() => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(result.current).toMatchObject({
          stage: "permission",
          permissionKind: "notifications"
        })
      })

      act(() => (result.current as any).dismissButtonTapped())
      expect(result.current).toMatchObject({
        stage: "permission",
        permissionKind: "backgroundLocation"
      })

      act(() => (result.current as any).dismissButtonTapped())
      expect(result.current).toEqual({ stage: "success" })
    })

    test("join event flow, error alerts", async () => {
      env.loadPermissions.mockResolvedValueOnce([])
      const { result } = renderUseJoinEvent()

      env.joinEvent.mockResolvedValueOnce("event-has-ended")
      await expectErrorAlertState(result, 1, "event-has-ended")

      env.joinEvent.mockResolvedValueOnce("event-was-cancelled")
      await expectErrorAlertState(result, 2, "event-was-cancelled")

      env.joinEvent.mockResolvedValueOnce("user-is-blocked")
      await expectErrorAlertState(result, 3, "user-is-blocked")

      env.joinEvent.mockRejectedValueOnce(new Error())
      await expectErrorAlertState(result, 4, "generic")
    })

    it("should update the details hook when joining an event successfully", async () => {
      env.loadPermissions.mockResolvedValueOnce(NON_REQUESTABLE_PERMISSIONS)
      env.joinEvent.mockResolvedValueOnce("success")
      const { result: eventDetailsResult } = renderUseEventDetails()
      const { result: joinEventResult } = renderUseJoinEvent()
      await waitFor(() => {
        expect(eventDetailsResult.current).toMatchObject({
          event: { userAttendeeStatus: "not-participating" }
        })
      })
      act(() => (joinEventResult.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(eventDetailsResult.current).toMatchObject({
          event: { userAttendeeStatus: "attending" }
        })
      })
    })

    it("should not update the details hook when joining an event unsuccessfully", async () => {
      env.loadPermissions.mockResolvedValueOnce(NON_REQUESTABLE_PERMISSIONS)
      env.joinEvent.mockResolvedValueOnce("event-has-ended")
      const { result: eventDetailsResult } = renderUseEventDetails()
      const { result: joinEventResult } = renderUseJoinEvent()
      await waitFor(() => {
        expect(eventDetailsResult.current).toMatchObject({
          event: { userAttendeeStatus: "not-participating" }
        })
      })
      act(() => (joinEventResult.current as any).joinButtonTapped())
      await verifyNeverOccurs(() => {
        expect(eventDetailsResult.current).toMatchObject({
          event: { userAttendeeStatus: "attending" }
        })
      })
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
      expect(result.current).toEqual({
        stage: "idle",
        joinButtonTapped: expect.any(Function)
      })
    }

    const renderUseEventDetails = () => {
      return renderSuccessfulUseLoadEventDetails(TEST_EVENT, queryClient)
    }

    const renderUseJoinEvent = () => {
      return renderHook(() => useJoinEventStages(TEST_EVENT, env), {
        wrapper: ({ children }: any) => (
          <TestQueryClientProvider client={queryClient}>
            {children}
          </TestQueryClientProvider>
        )
      })
    }
  })

  describe("JoinEventLogic tests", () => {
    const TEST_REQUEST = {
      id: 1,
      hasArrived: true,
      location: {
        ...mockEventRegion(),
        placemark: null,
        isInArrivalTrackingPeriod: true
      }
    }

    beforeEach(() => onJoinSuccessHandler.mockReset())

    it("should return success when API responds with 201", async () => {
      setTestRequestHandler(mockSuccessResponse(), 201)
      const result = await performTestJoinEvent(TEST_REQUEST)
      expect(result).toEqual("success")
    })

    it("should return success when API responds with 200", async () => {
      setTestRequestHandler(mockSuccessResponse(), 200)
      const result = await performTestJoinEvent(TEST_REQUEST)
      expect(result).toEqual("success")
    })

    it("should forward the 403 error", async () => {
      setTestRequestHandler({ error: "user-is-blocked" }, 403)
      const result = await performTestJoinEvent(TEST_REQUEST)
      expect(result).toEqual("user-is-blocked")
    })

    it("should omit the request body when hasArrived is false", async () => {
      setTestRequestHandler(mockSuccessResponse(), 200, "no-request-body")
      const result = await performTestJoinEvent({
        ...TEST_REQUEST,
        hasArrived: false
      })
      expect(result).toEqual("success")
    })

    it("should omit the request body when isInArrivalTrackingPeriod is false", async () => {
      setTestRequestHandler(mockSuccessResponse(), 200, "no-request-body")
      const result = await performTestJoinEvent({
        ...TEST_REQUEST,
        hasArrived: true,
        location: {
          ...TEST_REQUEST.location,
          isInArrivalTrackingPeriod: false
        }
      })
      expect(result).toEqual("success")
    })

    it("should run the on join success handler when successful", async () => {
      const response = mockSuccessResponse()
      setTestRequestHandler(response, 201)
      await performTestJoinEvent(TEST_REQUEST)
      expect(onJoinSuccessHandler).toHaveBeenCalledWith({
        ...response,
        location: TEST_REQUEST.location
      })
      expect(onJoinSuccessHandler).toHaveBeenCalledTimes(1)
    })

    it("should not run the on join success handler when unsuccessful", async () => {
      setTestRequestHandler({ error: "event-was-cancelled" }, 403)
      await performTestJoinEvent(TEST_REQUEST)
      expect(onJoinSuccessHandler).not.toHaveBeenCalled()
    })

    const onJoinSuccessHandler = jest.fn()

    const performTestJoinEvent = async (request: JoinEventRequest) => {
      return await joinEvent(request, TiFAPI.testAuthenticatedInstance, [
        onJoinSuccessHandler
      ])
    }

    const setTestRequestHandler = (
      response: object,
      status: 200 | 201 | 403,
      bodyExpectation: "no-request-body" | "request-body" = "request-body"
    ) => {
      mswServer.use(
        http.post(
          TiFAPI.testPath("/event/join/:eventId"),
          async ({ params, request }) => {
            expect(params.eventId).toEqual("1")
            try {
              const body = await request.json()
              if (bodyExpectation === "no-request-body") {
                return HttpResponse.error()
              }
              expect(body).toEqual({
                region: {
                  coordinate: TEST_REQUEST.location.coordinate,
                  arrivalRadiusMeters: TEST_REQUEST.location.arrivalRadiusMeters
                }
              })
            } catch {
              if (bodyExpectation === "request-body") {
                return HttpResponse.error()
              }
            }
            return HttpResponse.json(response, { status })
          }
        )
      )
    }
  })

  describe("SaveRecentLocationJoinEventHandler tests", () => {
    resetTestSQLiteBeforeEach()
    const recentsStorage = new SQLiteRecentLocationsStorage(testSQLite)

    it("should not save anything when the location has no placemark", async () => {
      const coordinate = mockLocationCoordinate2D()
      await saveRecentLocationJoinEventHandler(
        { location: { coordinate, placemark: null } },
        recentsStorage
      )
      const recents = await recentsStorage.locationsForCoordinates([coordinate])
      expect(recents).toEqual([])
    })

    it("should save the location when the location has a placemark with an joined-event annotation", async () => {
      const location = mockTiFLocation()
      await saveRecentLocationJoinEventHandler({ location }, recentsStorage)
      const recents = await recentsStorage.locationsForCoordinates([
        location.coordinate
      ])
      expect(recents).toEqual([{ location, annotation: "joined-event" }])
    })
  })

  const mockSuccessResponse = () => ({
    id: 1,
    upcomingRegions: [],
    isArrived: false,
    token: mockEventChatTokenRequest()
  })
})
