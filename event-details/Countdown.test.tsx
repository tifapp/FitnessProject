import { CurrentUserEvent } from "@shared-models/Event"
import { renderHook } from "@testing-library/react-native"
import {
  EventFormattedCountdown,
  UseEventCountdownResult,
  useEventCountdown
} from "./Countdown"
import { fakeTimers } from "@test-helpers/Timers"
import { dateRange, dayjs } from "@date-time"
import { act } from "react-test-renderer"

describe("EventDetailsCountdown tests", () => {
  describe("UseEventCountdown tests", () => {
    const TEST_CLIENT_RECEIVED_TIME = new Date()
    const BASE_TEST_EVENT_TIME = {
      clientReceivedTime: TEST_CLIENT_RECEIVED_TIME,
      dateRange: dateRange(
        TEST_CLIENT_RECEIVED_TIME,
        dayjs(TEST_CLIENT_RECEIVED_TIME).add(15, "minutes").toDate()
      )
    }

    fakeTimers()
    beforeEach(() => {
      jest.setSystemTime(BASE_TEST_EVENT_TIME.clientReceivedTime)
    })

    test("initial countdown, within 1 hour, returns 1 hour", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs.duration(1, "hours").asSeconds(),
        todayOrTomorrow: "today"
      })
      expectCountdown(result.current, { formatted: "1 hour" })
    })

    test("initial countdown, within 5 hours and 46 minutes, returns 6 hours", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs
          .duration(5, "hours")
          .add(46, "minutes")
          .asSeconds(),
        todayOrTomorrow: "today"
      })
      expectCountdown(result.current, { formatted: "6 hours" })
    })

    test("initial countdown, within 5 hours and 34 minutes, returns 5.5 hours", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs
          .duration(5, "hours")
          .add(34, "minute")
          .asSeconds(),
        todayOrTomorrow: "today"
      })
      expectCountdown(result.current, { formatted: "5.5 hours" })
    })

    test("initial countdown, within 5 hours and 24 minutes, returns 5.5 hours", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs
          .duration(5, "hours")
          .add(24, "minute")
          .asSeconds(),
        todayOrTomorrow: "today"
      })
      expectCountdown(result.current, { formatted: "5.5 hours" })
    })

    test("initial countdown, within 5 hours and 14 minutes, returns 5 hours", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs
          .duration(5, "hours")
          .add(14, "minute")
          .asSeconds(),
        todayOrTomorrow: "today"
      })
      expectCountdown(result.current, { formatted: "5 hours" })
    })

    test("initial countdown, starts today, but in more than 6 hours, returns today", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs.duration(8.5, "hours").asSeconds(),
        todayOrTomorrow: "today"
      })
      expectCountdown(result.current, { todayOrTomorrow: "Today" })
    })

    test("initial countdown, starts tomorrow, returns tomorrow", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs.duration(16, "hours").asSeconds(),
        todayOrTomorrow: "tomorrow"
      })
      expectCountdown(result.current, { todayOrTomorrow: "Tomorrow" })
    })

    test("initial countdown, starts in 2 days, returns 2 days", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs.duration(2, "days").asSeconds(),
        todayOrTomorrow: null
      })
      expectCountdown(result.current, { formatted: "2 days" })
    })

    test("initial countdown, starts in 1 week, returns a week", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs.duration(1, "week").asSeconds(),
        todayOrTomorrow: null
      })
      expectCountdown(result.current, { formatted: "1 week" })
    })

    test("initial countdown, starts in 2 weeks, returns 2 weeks", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs.duration(2, "weeks").asSeconds(),
        todayOrTomorrow: null
      })
      expectCountdown(result.current, { formatted: "2 weeks" })
    })

    test("initial countdown, starts in 1 month, returns a month", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs.duration(1, "month").asSeconds(),
        todayOrTomorrow: null
      })
      expectCountdown(result.current, { formatted: "1 month" })
    })

    test("initial countdown, starts in 2 months, returns 2 months", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs.duration(2, "months").asSeconds(),
        todayOrTomorrow: null
      })
      expectCountdown(result.current, { formatted: "2 months" })
    })

    test("initial countdown, starts in 14 months, returns a year", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs.duration(14, "months").asSeconds(),
        todayOrTomorrow: null
      })
      expectCountdown(result.current, { formatted: "1 year" })
    })

    test("initial countdown, offsets by client received time for initial countdown", () => {
      jest.setSystemTime(new Date(20_000))
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs.duration(10, "minutes").asSeconds(),
        clientReceivedTime: new Date(10_000),
        todayOrTomorrow: "today"
      })
      expect(result.current).toEqual({
        status: "starts-in",
        countdown: { formatted: "9:50" }
      })
    })

    test("counting down, starts-in", () => {
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: dayjs.duration(10, "minutes").asSeconds(),
        todayOrTomorrow: "today"
      })
      expectCountdown(result.current, { formatted: "10:00" })

      act(() => jest.advanceTimersByTime(1000))
      expectCountdown(result.current, { formatted: "9:59" })

      act(() => jest.advanceTimersByTime(20_000))
      expectCountdown(result.current, { formatted: "9:39" })
    })

    test("initial negative countdown, offsets by client received time", () => {
      const baseDate = new Date()
      const { result } = renderUseEventCountdown({
        secondsToStart: -dayjs.duration(10, "minutes").asSeconds(),
        dateRange: dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate()),
        clientReceivedTime: dayjs(baseDate).subtract(1, "minute").toDate(),
        todayOrTomorrow: "today"
      })
      expect(result.current).toEqual({
        status: "ends-in",
        countdown: { formatted: "49:00" }
      })
    })

    test("counting down, ends-in", () => {
      const baseDate = new Date()
      const { result } = renderUseEventCountdown({
        clientReceivedTime: baseDate,
        secondsToStart: -dayjs.duration(10, "minutes").asSeconds(),
        dateRange: dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate()),
        todayOrTomorrow: "today"
      })
      expectCountdown(result.current, { formatted: "50:00" })

      act(() => jest.advanceTimersByTime(1000))
      expectCountdown(result.current, { formatted: "49:59" })

      act(() => jest.advanceTimersByTime(20_000))
      expectCountdown(result.current, { formatted: "49:39" })
    })

    test("initial negative countdown, done when seconds to start is greater than dateRange", () => {
      const baseDate = new Date()
      const { result } = renderUseEventCountdown({
        ...BASE_TEST_EVENT_TIME,
        secondsToStart: -dayjs.duration(2, "hours").asSeconds(),
        dateRange: dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate()),
        todayOrTomorrow: "today"
      })
      expect(result.current).toEqual({ status: "done" })
    })

    const expectCountdown = (
      result: UseEventCountdownResult,
      countdown: EventFormattedCountdown
    ) => {
      expect((result as any).countdown).toEqual(countdown)
    }

    const renderUseEventCountdown = (time: CurrentUserEvent["time"]) => {
      return renderHook(() => useEventCountdown(time))
    }
  })
})
