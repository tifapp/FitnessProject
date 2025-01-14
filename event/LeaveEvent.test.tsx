import { ClientSideEvent } from "@event/ClientSideEvent"
import { captureAlerts } from "@test-helpers/Alerts"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import {
  TestQueryClientProvider,
  createTestQueryClient
} from "@test-helpers/ReactQuery"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { ALERTS, LeaveEventResult, useLeaveEvent } from "./LeaveEvent"
import { EventMocks } from "@event-details-boundary/MockData"
import { renderSuccessfulUseLoadEventDetails } from "@event-details-boundary/TestHelpers"

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

    const confirmLeave = async () => {
      await tapAlertButton("Leave")
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
              ...TEST_EVENT,
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
      act(() => result.current.leaveStarted?.())
      expect(alertPresentationSpy).toHaveBeenPresentedWith(
        ALERTS.confirmLeaveAttendee(TEST_EVENT.host)
      )
      await confirmLeave()
      act(() => resolveLeave?.("success"))
      await waitFor(() => expect(testEnv.onSuccess).toHaveBeenCalled())
    })
    test("Host leave event flow, delete option selected", async () => {
      let resolveLeave: ((result: LeaveEventResult) => void) | undefined
      const leavePromise = new Promise<LeaveEventResult>(
        (resolve) => (resolveLeave = resolve)
      )
      testEnv.leaveEvent.mockReturnValueOnce(leavePromise)
      const { result } = renderUseLeaveEvent({ userAttendeeStatus: "hosting" })

      act(() => result.current.leaveStarted?.())
      expect(alertPresentationSpy).toHaveBeenPresentedWith(
        ALERTS.confirmLeaveHost(TEST_EVENT.attendeeCount)
      )
      await confirmLeave()
      act(() => resolveLeave?.("success"))
      await waitFor(() => expect(testEnv.onSuccess).toHaveBeenCalled())
    })
    it("should not allow leaving the event when attendee status is not-participating", async () => {
      const { result } = renderUseLeaveEvent({
        userAttendeeStatus: "not-participating"
      })
      expect(result.current.leaveStarted).toEqual(undefined)
    })

    it("should not allow leaving the event when submitting leave", async () => {
      let resolveLeave: ((result: LeaveEventResult) => void) | undefined
      const leavePromise = new Promise<LeaveEventResult>(
        (resolve) => (resolveLeave = resolve)
      )
      testEnv.leaveEvent.mockReturnValueOnce(leavePromise)
      const { result } = renderUseLeaveEvent({
        userAttendeeStatus: "attending"
      })
      act(() => result.current.leaveStarted?.())
      await confirmLeave()
      await waitFor(() => {
        expect(result.current.leaveStarted).toEqual(undefined)
      })

      // NB: Ensure we don't get an "import after teardown" error.
      act(() => resolveLeave?.("success"))
      await waitFor(() => {
        expect(testEnv.onSuccess).toHaveBeenCalled()
      })
    })
    it("should not call onSuccess on non-successful Leave Event result", async () => {
      const { result: leaveEventResult } = renderUseLeaveEvent({
        userAttendeeStatus: "attending"
      })
      testEnv.leaveEvent.mockResolvedValueOnce("event-not-found")
      act(() => leaveEventResult.current.leaveStarted?.())
      await confirmLeave()
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
      act(() => leaveEventResult.current.leaveStarted?.())
      await confirmLeave()
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
      act(() => leaveEventResult.current.leaveStarted?.())
      await confirmLeave()
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          ALERTS["event-has-ended"]
        )
      })

      testEnv.leaveEvent.mockResolvedValueOnce("event-was-cancelled")
      act(() => leaveEventResult.current.leaveStarted?.())
      await confirmLeave()
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          ALERTS["event-was-cancelled"]
        )
      })
    })
  })
})
