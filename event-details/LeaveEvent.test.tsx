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
  const { tapAlertButton, alertPresentationSpy } = captureAlerts()

  const alertDeleteButtonTapped = async () => {
    await tapAlertButton("Delete")
  }

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
    act(() => (result.current as any).reselectButtonTapped())
    expect(result.current).toMatchObject({
      status: "select",
      attendeeStatus: "hosting"
    })
  })
})
