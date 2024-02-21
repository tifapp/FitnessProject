import { CurrentUserEvent } from "@shared-models/Event"
import { captureAlerts } from "@test-helpers/Alerts"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { LeaveEventResult, useLeaveEvent } from "./LeaveEvent"
import { EventMocks } from "./MockData"

describe("LeaveEvent tests", () => {
  beforeEach(() => jest.resetAllMocks())
  const testEnv = {
    leaveEvent: jest.fn(),
    onSuccess: jest.fn()
  }
  const TEST_EVENT = EventMocks.PickupBasketball
  const { alertPresentationSpy } = captureAlerts()

  const renderUseLeaveEvent = (testUserStatus: Pick<CurrentUserEvent, "userAttendeeStatus">) => {
    return renderHook(() => useLeaveEvent({ id: TEST_EVENT.id, userAttendeeStatus: testUserStatus.userAttendeeStatus }, testEnv), {
      wrapper: ({ children }: any) => (
        <TestQueryClientProvider>{children}</TestQueryClientProvider>
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

    expect(result.current).toEqual({
      status: "idle",
      leaveButtonTapped: expect.any(Function)
    })
    act(() => (result.current as any).leaveButtonTapped())
    expect(result.current).toEqual({
      status: "select",
      attendeeStatus: "attending",
      confirmButtonTapped: expect.any(Function),
      dismissButtonTapped: expect.any(Function)
    })
    act(() => (result.current as any).confirmButtonTapped())
    await waitFor(() => {
      expect(result.current).toEqual({
        status: "loading"
      })
    })
    act(() => resolveLeave?.("success"))
    await waitFor(() => {
      expect(result.current).toEqual({
        status: "success"
      })
    })
  })
  test("Attendee leave event flow, dismissed confirmation alert", async () => {
    const { result } = renderUseLeaveEvent({ userAttendeeStatus: "attending" })

    expect(result.current).toEqual({
      status: "idle",
      leaveButtonTapped: expect.any(Function)
    })
    act(() => (result.current as any).leaveButtonTapped())
    expect(result.current).toEqual({
      status: "select",
      attendeeStatus: "attending",
      confirmButtonTapped: expect.any(Function),
      dismissButtonTapped: expect.any(Function)
    })
    act(() => (result.current as any).dismissButtonTapped())
    expect(result.current).toEqual({
      status: "idle",
      leaveButtonTapped: expect.any(Function)
    })
  })
  test("Host leave event flow, cancel selected", async () => {
    const { result } = renderUseLeaveEvent({ userAttendeeStatus: "hosting" })

    expect(result.current).toEqual({
      status: "idle",
      leaveButtonTapped: expect.any(Function)
    })
    act(() => (result.current as any).leaveButtonTapped())
    expect(result.current).toEqual({
      status: "select",
      attendeeStatus: "hosting",
      deleteButtonTapped: expect.any(Function),
      reselectButtonTapped: expect.any(Function),
      dismissButtonTapped: expect.any(Function)
    })
    act(() => (result.current as any).deleteButtonTapped())
    await waitFor(() => {
      expect(alertPresentationSpy).toHaveBeenCalledWith(
        "Delete Event",
        "Are you sure you want to delete this event?", expect.any(Array)
      )
    })
    expect(result.current).toEqual({
      status: "idle",
      leaveButtonTapped: expect.any(Function)
    })
  })
  test("Host leave event flow, dismiss selected", async () => {
    const { result } = renderUseLeaveEvent({ userAttendeeStatus: "hosting" })

    expect(result.current).toEqual({
      status: "idle",
      leaveButtonTapped: expect.any(Function)
    })
    act(() => (result.current as any).leaveButtonTapped())
    expect(result.current).toEqual({
      status: "select",
      attendeeStatus: "hosting",
      deleteButtonTapped: expect.any(Function),
      reselectButtonTapped: expect.any(Function),
      dismissButtonTapped: expect.any(Function)
    })
    act(() => (result.current as any).dismissButtonTapped())
    expect(result.current).toEqual({
      status: "idle",
      leaveButtonTapped: expect.any(Function)
    })
  })
})
