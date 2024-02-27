import { CurrentUserEvent } from "@shared-models/Event"
import { renderHook } from "@testing-library/react-native"
import { useEventCountdownSeconds } from "./Countdown"
import { fakeTimers } from "@test-helpers/Timers"
import { dateRange, dayjs } from "@date-time"
import { act } from "react-test-renderer"

describe("EventDetailsCountdown tests", () => {
  describe("UseEventCountdown tests", () => {
    const renderUseEventCountdown = (time: CurrentUserEvent["time"]) => {
      return renderHook(() => {
        return useEventCountdownSeconds(time)
      })
    }

    const BASE_TEST_EVENT_TIME = {
      clientReceivedTime: new Date(),
      dateRange: dateRange(new Date(), new Date())
    }

    fakeTimers()
    beforeEach(() => {
      jest.setSystemTime(BASE_TEST_EVENT_TIME.clientReceivedTime)
    })

    test("initial countdown, uses secondsToStart offset by the client received time and current date", () => {
      jest.setSystemTime(new Date(20_000))
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs.duration(10, "minutes").asSeconds(),
        clientReceivedTime: new Date(10_000),
        todayOrTomorrow: "today"
      })
      expect(result.current).toEqual({ status: "starts-in", seconds: 590 })
    })

    test("counting down, starts-in", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs.duration(10, "minutes").asSeconds(),
        todayOrTomorrow: "today"
      })
      expect(result.current).toEqual({ status: "starts-in", seconds: 600 })

      act(() => jest.advanceTimersByTime(1000))
      expect(result.current).toEqual({ status: "starts-in", seconds: 599 })

      act(() => jest.advanceTimersByTime(20_000))
      expect(result.current).toEqual({ status: "starts-in", seconds: 579 })
    })

    test("negative countdown, offsets by client received time for initial seconds", () => {
      const baseDate = new Date()
      const { result } = renderUseEventCountdown({
        secondsToStart: -dayjs.duration(10, "minutes").asSeconds(),
        dateRange: dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate()),
        clientReceivedTime: dayjs(baseDate).subtract(1, "minute").toDate(),
        todayOrTomorrow: "today"
      })
      expect(result.current).toEqual({
        status: "ends-in",
        seconds: dayjs.duration(49, "minute").asSeconds()
      })
    })

    test("counting down, ends-in", () => {
      const baseDate = new Date()
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: -dayjs.duration(10, "minutes").asSeconds(),
        dateRange: dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate()),
        todayOrTomorrow: "today"
      })
      expect(result.current).toEqual({
        status: "ends-in",
        seconds: dayjs.duration(50, "minute").asSeconds()
      })

      act(() => jest.advanceTimersByTime(1000))
      expect(result.current).toEqual({
        status: "ends-in",
        seconds: dayjs.duration(50, "minute").subtract(1, "second").asSeconds()
      })

      act(() => jest.advanceTimersByTime(20_000))
      expect(result.current).toEqual({
        status: "ends-in",
        seconds: dayjs.duration(50, "minute").subtract(21, "second").asSeconds()
      })
    })

    test("negative countdown, done when seconds to start is greater than dateRange", () => {
      const baseDate = new Date()
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: -dayjs.duration(2, "hours").asSeconds(),
        dateRange: dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate()),
        todayOrTomorrow: "today"
      })
      expect(result.current).toEqual({ status: "done" })
    })

    // test("initial countdown, within 8 hours, returns left and right as hours and minutes", () => {
    //   const { result } = renderUseEventCountdown({
    //     secondsToStart: dayjs.duration(7.5, "hours").asSeconds(),
    //     todayOrTomorrow: "today"
    //   })
    //   expect(result.current).toEqual({ left: 7, right: 30 })
    // })

    // test("initial countdown, starts today, but in more than 8 hours, returns today", () => {
    //   const { result } = renderUseEventCountdown({
    //     secondsToStart: dayjs.duration(8.5, "hours").asSeconds(),
    //     todayOrTomorrow: "today"
    //   })
    //   expect(result.current).toEqual({ todayOrTomorrow: "Today" })
    // })

    // test("initial countdown, starts tomorrow, returns tomorrow", () => {
    //   const { result } = renderUseEventCountdown({
    //     secondsToStart: dayjs.duration(16, "hours").asSeconds(),
    //     todayOrTomorrow: "tomorrow"
    //   })
    //   expect(result.current).toEqual({ todayOrTomorrow: "Tomorrow" })
    // })

    // test("initial countdown, starts in 2 days, returns 2 days", () => {
    //   const { result } = renderUseEventCountdown({
    //     secondsToStart: dayjs.duration(2, "days").asSeconds(),
    //     todayOrTomorrow: null
    //   })
    //   expect(result.current).toEqual({ formatted: "2 days" })
    // })

    // test("initial countdown, starts in 1 week, returns a week", () => {
    //   const { result } = renderUseEventCountdown({
    //     secondsToStart: dayjs.duration(1, "week").asSeconds(),
    //     todayOrTomorrow: null
    //   })
    //   expect(result.current).toEqual({ formatted: "A week" })
    // })

    // test("initial countdown, starts in 2 weeks, returns 2 weeks", () => {
    //   const { result } = renderUseEventCountdown({
    //     secondsToStart: dayjs.duration(16, "hours").asSeconds(),
    //     todayOrTomorrow: "tomorrow"
    //   })
    //   expect(result.current).toEqual({ formatted: "2 weeks" })
    // })

    // test("initial countdown, starts in 1 month, returns a month", () => {
    //   const { result } = renderUseEventCountdown({
    //     secondsToStart: dayjs.duration(1, "month").asSeconds(),
    //     todayOrTomorrow: null
    //   })
    //   expect(result.current).toEqual({ formatted: "A month" })
    // })

    // test("initial countdown, starts in 2 months, returns 2 months", () => {
    //   const { result } = renderUseEventCountdown({
    //     secondsToStart: dayjs.duration(2, "months").asSeconds(),
    //     todayOrTomorrow: null
    //   })
    //   expect(result.current).toEqual({ formatted: "2 months" })
    // })

    // test("initial countdown, starts in 14 months, returns 14 months", () => {
    //   const { result } = renderUseEventCountdown({
    //     secondsToStart: dayjs.duration(14, "months").asSeconds(),
    //     todayOrTomorrow: null
    //   })
    //   expect(result.current).toEqual({ formatted: "14 months" })
    // })
  })
})
