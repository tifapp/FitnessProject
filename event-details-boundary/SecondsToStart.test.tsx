import { dayjs } from "@date-time"
import { act, renderHook } from "@testing-library/react-native"
import {
  useEventSecondsToStart,
  UseEventSecondsToStartProps
} from "./SecondsToStart"
import { fakeTimers } from "@test-helpers/Timers"

describe("EventDetailsSecondsToStart tests", () => {
  describe("UseEventSecondsToStart tests", () => {
    fakeTimers()

    it("should offset the initial seconds to start by the client received time", () => {
      jest.setSystemTime(new Date(20_000))
      const { result } = renderUseEventSecondsToStart({
        secondsToStart: dayjs.duration(10, "minutes").asSeconds(),
        clientReceivedTime: new Date(10_000)
      })
      expect(result.current).toEqual(
        dayjs.duration(9, "minutes").add(50, "seconds").asSeconds()
      )
    })

    test("counting down", () => {
      const { result } = renderUseEventSecondsToStart({
        secondsToStart: dayjs.duration(10, "minutes").asSeconds(),
        clientReceivedTime: new Date()
      })
      expect(result.current).toEqual(dayjs.duration(10, "minutes").asSeconds())

      act(() => jest.advanceTimersByTime(1000))
      expect(result.current).toEqual(
        dayjs.duration(9, "minutes").add(59, "seconds").asSeconds()
      )

      act(() => jest.advanceTimersByTime(20_000))
      expect(result.current).toEqual(
        dayjs.duration(9, "minutes").add(39, "seconds").asSeconds()
      )
    })

    const renderUseEventSecondsToStart = (
      time: UseEventSecondsToStartProps
    ) => {
      return renderHook(useEventSecondsToStart, { initialProps: time })
    }
  })
})
