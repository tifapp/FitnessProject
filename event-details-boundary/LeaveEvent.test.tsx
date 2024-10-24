import { ClientSideEvent } from "@event/ClientSideEvent"
import { captureAlerts } from "@test-helpers/Alerts"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "@test-helpers/ReactQuery"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import {
  LEAVE_EVENT_ALERTS,
  LeaveEventResult,
  useLeaveEvent
} from "./LeaveEvent"
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

    const renderUseEventDetails = (event: ClientSideEvent) => {
      return renderSuccessfulUseLoadEventDetails(event, queryClient)
    }

    const renderUseLeaveEvent = (
      testUserStatus: Pick<ClientSideEvent, "userAttendeeStatus">
    ) => {
      return renderHook(
        () =>
          useLeaveEvent(
            {
              id: TEST_EVENT.id,
              userAttendeeStatus: testUserStatus.userAttendeeStatus
            },
            testEnv
          ),
        {
          wrapper: ({ children }: any) => (
            <TestQueryClientProvider client={queryClient}>
              {children}
            </TestQueryClientProvider>
          )
        }
      )
    }

    test("Attendee leave event flow, accepted confirmation alert", async () => {
      let resolveLeave: ((result: LeaveEventResult) => void) | undefined
      const leavePromise = new Promise<LeaveEventResult>(
        (resolve) => (resolveLeave = resolve)
      )
      testEnv.leaveEvent.mockReturnValueOnce(leavePromise)
      const { result } = renderUseLeaveEvent({
        userAttendeeStatus: "attending"
      })

      expect(result.current).toMatchObject({
        status: "select",
        isLoading: false,
        attendeeStatus: "attending"
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
        attendeeStatus: "hosting"
      })
      act(() => (result.current as any).deleteButtonTapped())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalled()
      })
      await alertDeleteButtonTapped()
      act(() => resolveLeave?.("success"))
      await waitFor(() => {
        expect(result.current).toMatchObject({
          status: "success"
        })
      })
    })
    it("should change attendee status to host when Leave Event returns co-host-not-found", async () => {
      const { result: leaveEventResult } = renderUseLeaveEvent({
        userAttendeeStatus: "attending"
      })
      const { result: eventDetailsResult } = renderUseEventDetails({
        ...TEST_EVENT,
        userAttendeeStatus: "attending"
      })
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
      const { result: leaveEventResult } = renderUseLeaveEvent({
        userAttendeeStatus: "attending"
      })
      testEnv.leaveEvent.mockResolvedValueOnce("co-host-not-found")
      act(() => (leaveEventResult.current as any).confirmButtonTapped())
      await verifyNeverOccurs(() =>
        expect(testEnv.onSuccess).toHaveBeenCalled()
      )
    })
    it("should change attendee status to not-participating when Leave Event returns success", async () => {
      const { result: leaveEventResult } = renderUseLeaveEvent({
        userAttendeeStatus: "attending"
      })
      const { result: eventDetailsResult } = renderUseEventDetails({
        ...TEST_EVENT,
        userAttendeeStatus: "attending"
      })
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
      const { result: leaveEventResult } = renderUseLeaveEvent({
        userAttendeeStatus: "attending"
      })
      testEnv.leaveEvent.mockResolvedValueOnce("event-has-ended")
      act(() => (leaveEventResult.current as any).confirmButtonTapped())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          LEAVE_EVENT_ALERTS["event-has-ended"]
        )
      })

      testEnv.leaveEvent.mockResolvedValueOnce("event-was-cancelled")
      act(() => (leaveEventResult.current as any).confirmButtonTapped())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          LEAVE_EVENT_ALERTS["event-was-cancelled"]
        )
      })

      testEnv.leaveEvent.mockResolvedValueOnce("co-host-not-found")
      act(() => (leaveEventResult.current as any).confirmButtonTapped())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          LEAVE_EVENT_ALERTS["co-host-not-found"]
        )
      })
    })
    test("onSuccess should be called correctly if given a success status", async () => {
      const { result: leaveEventResult } = renderUseLeaveEvent({
        userAttendeeStatus: "attending"
      })
      testEnv.leaveEvent.mockResolvedValueOnce("success")
      act(() => (leaveEventResult.current as any).confirmButtonTapped())
      await waitFor(() => expect(testEnv.onSuccess).toHaveBeenCalled())
    })
  })
})
