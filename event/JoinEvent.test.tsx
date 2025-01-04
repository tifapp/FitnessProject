import { EventArrivals } from "@arrival-tracking"
import { mockEventRegion } from "@arrival-tracking/MockData"
import { TrueRegionMonitor } from "@arrival-tracking/region-monitoring/MockRegionMonitors"
import { EventMocks, mockEventLocation } from "@event-details-boundary/MockData"
import { renderSuccessfulUseLoadEventDetails } from "@event-details-boundary/TestHelpers"
import { mockLocationCoordinate2D, mockTiFLocation } from "@location/MockData"
import { SQLiteRecentLocationsStorage } from "@location/Recents"
import { captureAlerts } from "@test-helpers/Alerts"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import "@test-helpers/Matchers"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "@test-helpers/ReactQuery"
import { resetTestSQLiteBeforeEach, testSQLite } from "@test-helpers/SQLite"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { TiFAPI, TiFEndpointResponse } from "TiFShared/api"
import { mockTiFServer } from "TiFShared/test-helpers/mockAPIServer"
import {
  JOIN_EVENT_ERROR_ALERTS,
  JoinEventRequest,
  JoinEventResult,
  joinEvent,
  saveRecentLocationJoinEventHandler,
  useJoinEvent
} from "./JoinEvent"

describe("JoinEvent tests", () => {
  describe("UseJoinEvent tests", () => {
    const { alertPresentationSpy } = captureAlerts()
    const queryClient = createTestQueryClient()

    const env = {
      joinEvent: jest.fn(),
      monitor: TrueRegionMonitor,
      loadPermissions: jest.fn(),
      onSuccess: jest.fn()
    }

    const TEST_EVENT = {
      ...EventMocks.PickupBasketball,
      id: 1,
      location: mockEventLocation(),
      userAttendeeStatus: "not-participating"
    } as const

    const TEST_BANNER_CONTENTS = {
      title: "Test",
      description: "Test",
      ctaText: "TEST"
    }

    const NON_REQUESTABLE_PERMISSIONS = [
      {
        kind: "notifications",
        canRequestPermission: false,
        requestPermission: jest.fn().mockResolvedValueOnce(true),
        bannerContents: TEST_BANNER_CONTENTS
      },
      {
        kind: "backgroundLocation",
        canRequestPermission: false,
        requestPermission: jest.fn().mockResolvedValueOnce(true),
        bannerContents: TEST_BANNER_CONTENTS
      }
    ] as const

    const REQUESTABLE_PERMISSIONS = NON_REQUESTABLE_PERMISSIONS.map((p) => ({
      ...p,
      canRequestPermission: true
    }))

    beforeEach(async () => {
      Object.values(env).forEach((m) => "mockReset" in m && m.mockReset())
      await act(async () => queryClient.clear())
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

      await act(async () => (result.current as any).joinButtonTapped())
      await waitFor(() => expect(result.current.stage).toEqual("pending"))
      await act(async () => resolveJoin?.("success"))
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

      await act(async () => (result.current as any).requestButtonTapped())
      await waitFor(() => {
        expect(result.current).toMatchObject({
          stage: "permission",
          permissionKind: "backgroundLocation"
        })
      })

      expect(env.onSuccess).not.toHaveBeenCalled()
      await act(async () => (result.current as any).requestButtonTapped())
      await waitFor(() =>
        expect(result.current).toMatchObject({ stage: "idle" })
      )
      await waitFor(() => {
        expect(env.onSuccess).toHaveBeenCalledTimes(1)
      })
    })

    test("join event flow, skips false permissions", async () => {
      env.loadPermissions.mockResolvedValueOnce([
        NON_REQUESTABLE_PERMISSIONS[0],
        { ...NON_REQUESTABLE_PERMISSIONS[1], canRequestPermission: true }
      ])
      env.joinEvent.mockResolvedValueOnce("success")
      const { result } = renderUseJoinEvent()

      await act(async () => (result.current as any).joinButtonTapped())
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

      expect(env.onSuccess).not.toHaveBeenCalled()
      await act(async () => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(result.current).toMatchObject({ stage: "idle" })
      })
      await waitFor(() => {
        expect(env.onSuccess).toHaveBeenCalledTimes(1)
      })
    })

    test("join event flow, can join multiple times", async () => {
      env.loadPermissions.mockResolvedValueOnce(NON_REQUESTABLE_PERMISSIONS)
      env.joinEvent.mockResolvedValue("success")
      const { result } = renderUseJoinEvent()

      expect(env.onSuccess).not.toHaveBeenCalled()
      await act(async () => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(result.current).toMatchObject({ stage: "idle" })
      })
      await waitFor(() => {
        expect(env.onSuccess).toHaveBeenCalledTimes(1)
      })
      await act(async () => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(env.onSuccess).toHaveBeenCalledTimes(2)
      })
    })

    test("join event flow, dismiss permissions", async () => {
      env.loadPermissions.mockResolvedValueOnce(REQUESTABLE_PERMISSIONS)
      env.joinEvent.mockResolvedValueOnce("success")
      const { result } = renderUseJoinEvent()

      await act(async () => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(result.current).toMatchObject({
          stage: "permission",
          permissionKind: "notifications"
        })
      })

      await act(async () => (result.current as any).dismissButtonTapped())
      expect(result.current).toMatchObject({
        stage: "permission",
        permissionKind: "backgroundLocation"
      })

      await act(async () => (result.current as any).dismissButtonTapped())
      expect(result.current).toMatchObject({ stage: "idle" })
    })

    test("join event flow, error alerts", async () => {
      env.loadPermissions.mockResolvedValueOnce([])
      const { result } = renderUseJoinEvent()

      env.joinEvent.mockResolvedValueOnce("event-has-ended")
      await expectErrorAlertState(result, 1, "event-has-ended")

      env.joinEvent.mockResolvedValueOnce("event-was-cancelled")
      await expectErrorAlertState(result, 2, "event-was-cancelled")

      env.joinEvent.mockResolvedValueOnce("blocked-you")
      await expectErrorAlertState(result, 3, "blocked-you")

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
      await act(async () => (joinEventResult.current as any).joinButtonTapped())
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
      await act(async () => (joinEventResult.current as any).joinButtonTapped())
      await verifyNeverOccurs(() => {
        expect(eventDetailsResult.current).toMatchObject({
          event: { userAttendeeStatus: "attending" }
        })
      })
    })

    const expectErrorAlertState = async (
      result: { current: ReturnType<typeof useJoinEvent> },
      callIndex: number,
      key: keyof typeof JOIN_EVENT_ERROR_ALERTS
    ) => {
      await act(async () => (result.current as any).joinButtonTapped())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenNthPresentedWith(
          callIndex,
          JOIN_EVENT_ERROR_ALERTS[key]
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
      return renderHook(() => useJoinEvent(TEST_EVENT, env), {
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
        placemark: undefined,
        isInArrivalTrackingPeriod: true
      }
    }

    beforeEach(() => onJoinSuccessHandler.mockReset())

    it("should return success when API responds with 201", async () => {
      setTestRequestHandler(201, mockSuccessResponse())
      const result = await performTestJoinEvent(TEST_REQUEST)
      expect(result).toEqual("success")
    })

    it("should return success when API responds with 200", async () => {
      setTestRequestHandler(200, mockSuccessResponse())
      const result = await performTestJoinEvent(TEST_REQUEST)
      expect(result).toEqual("success")
    })

    it("should forward the 403 error", async () => {
      setTestRequestHandler(403, { error: "blocked-you" })
      const result = await performTestJoinEvent(TEST_REQUEST)
      expect(result).toEqual("blocked-you")
    })

    it("should omit the request body when hasArrived is false", async () => {
      setTestRequestHandler(200, mockSuccessResponse(), "no-request-body")
      const result = await performTestJoinEvent({
        ...TEST_REQUEST,
        hasArrived: false
      })
      expect(result).toEqual("success")
    })

    it("should omit the request body when isInArrivalTrackingPeriod is false", async () => {
      setTestRequestHandler(200, mockSuccessResponse(), "no-request-body")
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
      setTestRequestHandler(201, response)
      await performTestJoinEvent(TEST_REQUEST)
      expect(onJoinSuccessHandler).toHaveBeenCalledWith({
        arrivals: EventArrivals.fromRegions(response.trackableRegions),
        locationIdentifier: TEST_REQUEST.location
      })
      expect(onJoinSuccessHandler).toHaveBeenCalledTimes(1)
    })

    it("should not run the on join success handler when unsuccessful", async () => {
      setTestRequestHandler(403, { error: "event-was-cancelled" })
      await performTestJoinEvent(TEST_REQUEST)
      expect(onJoinSuccessHandler).not.toHaveBeenCalled()
    })

    const onJoinSuccessHandler = jest.fn()

    const performTestJoinEvent = async (request: JoinEventRequest) => {
      return await joinEvent(request, TiFAPI.testAuthenticatedInstance, [
        onJoinSuccessHandler
      ])
    }

    const setTestRequestHandler = <
      Status extends 200 | 201 | 403 | 404,
      Data extends TiFEndpointResponse<"joinEvent", Status>
    >(
      status: Status,
      data: Data,
      bodyExpectation: "no-request-body" | "request-body" = "request-body"
    ) => {
      mockTiFServer({
        joinEvent: {
          expectedRequest: {
            params: {
              eventId: "1" as any // TODO: - Why does this have to be a string?
            },
            body:
              bodyExpectation === "no-request-body"
                ? undefined
                : {
                    region: {
                      coordinate: TEST_REQUEST.location.coordinate,
                      arrivalRadiusMeters:
                        TEST_REQUEST.location.arrivalRadiusMeters
                    }
                  }
          },
          mockResponse: { status, data } as any // NB: Typescript not inferring response properly
        }
      })
    }
  })

  describe("SaveRecentLocationJoinEventHandler tests", () => {
    resetTestSQLiteBeforeEach()
    const recentsStorage = new SQLiteRecentLocationsStorage(testSQLite)

    it("should not save anything when the location has no placemark", async () => {
      const coordinate = mockLocationCoordinate2D()
      await saveRecentLocationJoinEventHandler(
        { locationIdentifier: { coordinate, placemark: undefined } },
        recentsStorage
      )
      const recents = await recentsStorage.locationsForCoordinates([coordinate])
      expect(recents).toEqual([])
    })

    it("should save the location when the location has a placemark with an joined-event annotation", async () => {
      const location = mockTiFLocation()
      await saveRecentLocationJoinEventHandler(
        { locationIdentifier: location },
        recentsStorage
      )
      const recents = await recentsStorage.locationsForCoordinates([
        location.coordinate
      ])
      expect(recents).toEqual([{ location, annotation: "joined-event" }])
    })
  })

  const mockSuccessResponse = () => ({
    id: 1,
    trackableRegions: [],
    hasArrived: false
  })
})
