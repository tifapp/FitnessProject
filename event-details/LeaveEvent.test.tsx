import { EventAttendee } from "@shared-models/Event"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { renderHook } from "@testing-library/react-native"
import { useLeaveEvent } from "./LeaveEvent"
import { EventAttendeeMocks, EventMocks } from "./MockData"

describe("LeaveEvent tests", () => {
  beforeEach(() => jest.resetAllMocks())
  const leaveEvent = jest.fn()
  const TEST_EVENT = EventMocks.PickupBasketball

  const renderUseLeaveEvent = (attendee: EventAttendee) => {
    return renderHook(() => useLeaveEvent(leaveEvent, TEST_EVENT, attendee), {
      wrapper: ({ children }: any) => (
        <TestQueryClientProvider>{children}</TestQueryClientProvider>
      )
    })
  }

  test("Attendee leave event flow, only confirmation alert needed", () => {
    const mockAttendee = EventAttendeeMocks.Alivs
    leaveEvent.mockImplementation(() => {
      return { status: "success" }
    }
    )
    const { result } = renderUseLeaveEvent(mockAttendee)
    expect(leaveEvent).toBeCalledWith(TEST_EVENT, mockAttendee)
    expect(leaveEvent).toBeCalledTimes(1)
    expect(result.current).toMatchObject({
      status: "success"
    })
  })

  test("Attendee leave event flow, generic error case", () => {
    const mockAttendee = EventAttendeeMocks.Alivs
    leaveEvent.mockImplementation(() => {
      return { status: "error" }
    }
    )
    const { result } = renderUseLeaveEvent(mockAttendee)
    expect(leaveEvent).toBeCalledWith(TEST_EVENT, mockAttendee)
    expect(leaveEvent).toBeCalledTimes(1)
    expect(result.current).toMatchObject({
      status: "error"
    })
  })

  //   test("Host leave event flow, cancel event altogether", () => {

  //   })
  //   test("Host leave event flow, pick new host", () => {

  //   })
})
