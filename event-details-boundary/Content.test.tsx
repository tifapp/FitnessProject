import { fakeTimers } from "@test-helpers/Timers"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { useDisplayedEventDetailsLoadingBalls } from "./Content"

describe("EventDetailsLoading tests", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  describe("UseDisplayedEventDetailsLoadingBalls tests", () => {
    fakeTimers()

    test("appearance cycle", async () => {
      const { result } = renderUseDisplayedEventDetailsLoadingBalls()
      const assert = async (one: boolean, two: boolean, three: boolean) => {
        await waitFor(() => expect(result.current).toEqual([one, two, three]))
      }

      await assert(false, false, false)
      act(() => jest.advanceTimersByTime(100))
      await assert(false, false, false)
      act(() => jest.advanceTimersByTime(400))
      await assert(true, false, false)
      act(() => jest.advanceTimersByTime(500))
      await assert(true, true, false)
      act(() => jest.advanceTimersByTime(500))
      await assert(true, true, true)
      act(() => jest.advanceTimersByTime(500))
      await assert(false, false, false)
      act(() => jest.advanceTimersByTime(500))
      await assert(true, false, false)
    })

    const renderUseDisplayedEventDetailsLoadingBalls = () => {
      return renderHook(useDisplayedEventDetailsLoadingBalls, {
        initialProps: 500
      })
    }
  })
})
