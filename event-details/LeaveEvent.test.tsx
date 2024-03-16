import { CurrentUserEvent } from "@shared-models/Event"
import { captureAlerts } from "@test-helpers/Alerts"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import { TestQueryClientProvider, createTestQueryClient } from "@test-helpers/ReactQuery"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { LeaveEventResult, useLeaveEvent } from "./LeaveEvent"
import { EventMocks } from "./MockData"
import { renderSuccessfulUseLoadEventDetails } from "./TestHelpers"

describe("LeaveEvent tests", () => {
  const queryClient = createTestQueryClient()
  beforeEach(() => {
    jest.resetAllMocks()
    queryClient.clear()
  })
  describe("useLeaveEvent tests", () => {
    const testEnv = {
      leaveEvent: jest.fn(),
      onSuccess: jest.fn()
    }
    const TEST_EVENT = EventMocks.PickupBasketball
    const { tapAlertButton, alertPresentationSpy } = captureAlerts()

    const alertDeleteButtonTapped = async () => {
      await tapAlertButton("Delete")
    }

    const dismissAlert = async () => {
      await tapAlertButton("OK")
    }

    const renderUseEventDetails = (event: CurrentUserEvent) => {
      return renderSuccessfulUseLoadEventDetails(event, queryClient)
    }

    const renderUseLeaveEvent = (testUserStatus: Pick<CurrentUserEvent, "userAttendeeStatus">) => {
      return renderHook(() => useLeaveEvent({ id: TEST_EVENT.id, userAttendeeStatus: testUserStatus.userAttendeeStatus }, testEnv), {
        wrapper: ({ children }: any) => (
          <TestQueryClientProvider client={queryClient}>{children}</TestQueryClientProvider>
        )
      })
    }

    test("Attendee leave event flow, accepted confirmation alert", async () => {
      let resolveLeave: ((result: LeaveEventResult) => void) | undefined
      const leavePromise = new Promise<LeaveEventResult>(
        (resolve) => (resolveLeave = resolve)
      )
      testEnv.leaveEvent.mockReturnValueOnce(leavePromise)
      const { result } = renderUseLeaveEvent({ userAttendeeStatus: "attending" })

      expect(result.current).toMatchObject({
        status: "select",
        isLoading: false,
        attendeeStatus: "attending",
        confirmButtonTapped: expect.any(Function)
      })
      act(() => (result.current as any).confirmButtonTapped())
      act(() => resolveLeave?.("success"))
      await waitFor(() => {
        expect(result.current).toMatchObject({
          status: "success"
        })
      })
    })
    test("Host leave event flow, delete option selected", async () => {
      let resolveLeave: ((result: LeaveEventResult) => void) | undefined
      const leavePromise = new Promise<LeaveEventResult>(
        (resolve) => (resolveLeave = resolve)
      )
      testEnv.leaveEvent.mockReturnValueOnce(leavePromise)
      const { result } = renderUseLeaveEvent({ userAttendeeStatus: "hosting" })

      expect(result.current).toMatchObject({
        status: "select",
        isLoading: false,
        attendeeStatus: "hosting",
        deleteButtonTapped: expect.any(Function),
        reselectButtonTapped: expect.any(Function)
      })
      act(() => (result.current as any).deleteButtonTapped())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          "Delete Event",
          "Are you sure you want to delete this event?", expect.any(Array)
        )
      })
      await alertDeleteButtonTapped()
      act(() => resolveLeave?.("success"))
      await waitFor(() => {
        expect(result.current).toMatchObject({
          status: "success"
        })
      })
    })
    test("Host leave event flow, reselect option selected", async () => {
      const { result } = renderUseLeaveEvent({ userAttendeeStatus: "hosting" })

      expect(result.current).toMatchObject({
        status: "select",
        isLoading: false,
        attendeeStatus: "hosting",
        deleteButtonTapped: expect.any(Function),
        reselectButtonTapped: expect.any(Function)
      })
      act(() => (result.current as any).reselectButtonTapped())
      expect(result.current).toMatchObject({
        status: "select",
        attendeeStatus: "hosting"
      })
    })
    it("should change attendee status to host when Leave Event returns co-host-not-found", async () => {
      const { result: leaveEventResult } = renderUseLeaveEvent({ userAttendeeStatus: "attending" })
      const { result: eventDetailsResult } = renderUseEventDetails({ ...TEST_EVENT, userAttendeeStatus: "attending" })
      await waitFor(() => {
        expect(eventDetailsResult.current).toMatchObject({
          event: { userAttendeeStatus: "attending" }
        })
      })
      testEnv.leaveEvent.mockResolvedValueOnce("co-host-not-found")
      act(() => (leaveEventResult.current as any).confirmButtonTapped())
      await waitFor(() => {
        expect(eventDetailsResult.current).toMatchObject({
          event: { userAttendeeStatus: "hosting" }
        })
      })
    })
    it("should not call onSuccess on non-successful Leave Event result", async () => {
      const { result: leaveEventResult } = renderUseLeaveEvent({ userAttendeeStatus: "attending" })
      testEnv.leaveEvent.mockResolvedValueOnce("co-host-not-found")
      act(() => (leaveEventResult.current as any).confirmButtonTapped())
      await verifyNeverOccurs(() => expect(testEnv.onSuccess).toHaveBeenCalled())
    })
    it("should change attendee status to not-participating when Leave Event returns success", async () => {
      const { result: leaveEventResult } = renderUseLeaveEvent({ userAttendeeStatus: "attending" })
      const { result: eventDetailsResult } = renderUseEventDetails({ ...TEST_EVENT, userAttendeeStatus: "attending" })
      await waitFor(() => {
        expect(eventDetailsResult.current).toMatchObject({
          event: { userAttendeeStatus: "attending" }
        })
      })
      testEnv.leaveEvent.mockResolvedValueOnce("success")
      act(() => (leaveEventResult.current as any).confirmButtonTapped())
      await waitFor(() => {
        expect(eventDetailsResult.current).toMatchObject({
          event: { userAttendeeStatus: "not-participating" }
        })
      })
    })
    test("Error alerts appear correctly for error cases", async () => {
      const { result: leaveEventResult } = renderUseLeaveEvent({ userAttendeeStatus: "attending" })
      testEnv.leaveEvent.mockResolvedValueOnce("event-has-ended")
      act(() => (leaveEventResult.current as any).confirmButtonTapped())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          "Event has ended",
          "This event has ended. You will be moved to the previous screen.", expect.any(Array)
        )
      })
      await waitFor(() => dismissAlert())
      testEnv.leaveEvent.mockResolvedValueOnce("event-was-cancelled")
      act(() => (leaveEventResult.current as any).confirmButtonTapped())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          "Event was cancelled",
          "This event was cancelled. You will be moved to the previous screen.", expect.any(Array)
        )
      })
      await waitFor(() => dismissAlert())
      testEnv.leaveEvent.mockResolvedValueOnce("co-host-not-found")
      act(() => (leaveEventResult.current as any).confirmButtonTapped())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          "Event has no co-host",
          "This event has no co-host. To leave, you will need to select a new host.", expect.any(Array)
        )
      })
    })
    test("onSuccess should be called correctly if given a success status", async () => {
      const { result: leaveEventResult } = renderUseLeaveEvent({ userAttendeeStatus: "attending" })
      testEnv.leaveEvent.mockResolvedValueOnce("success")
      act(() => (leaveEventResult.current as any).confirmButtonTapped())
      await waitFor(() => expect(testEnv.onSuccess).toHaveBeenCalled())
    })
  })
})
