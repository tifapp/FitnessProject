import { dayjs } from "TiFShared/lib/Dayjs"
import {
  EventFormattedCountdown,
  EventCountdown,
  eventCountdown
} from "./Countdown"
import { fakeTimers } from "@test-helpers/Timers"
import { dateRange } from "TiFShared/domain-models/FixedDateRange"

describe("EventDetailsCountdown tests", () => {
  describe("EventCountdown tests", () => {
    fakeTimers()

    const BASE_TEST_DATE_RANGE = dateRange(
      new Date(),
      dayjs().add(15, "minutes").toDate()
    )!

    test("within 1 hour, returns 1 hour", () => {
      const countdown = eventCountdown(
        dayjs.duration(1, "hours").asSeconds(),
        BASE_TEST_DATE_RANGE,
        "today"
      )
      expectFormattedCountdown(countdown, { formatted: "1 hour" })
    })

    test("within 5 hours and 46 minutes, returns 6 hours", () => {
      const countdown = eventCountdown(
        dayjs.duration(5, "hours").add(46, "minutes").asSeconds(),
        BASE_TEST_DATE_RANGE,
        "today"
      )
      expectFormattedCountdown(countdown, { formatted: "6 hours" })
    })

    test("within 5 hours and 34 minutes, returns 5.5 hours", () => {
      const countdown = eventCountdown(
        dayjs.duration(5, "hours").add(34, "minute").asSeconds(),
        BASE_TEST_DATE_RANGE,
        "today"
      )
      expectFormattedCountdown(countdown, { formatted: "5.5 hours" })
    })

    test("within 5 hours and 24 minutes, returns 5.5 hours", () => {
      const countdown = eventCountdown(
        dayjs.duration(5, "hours").add(24, "minute").asSeconds(),
        BASE_TEST_DATE_RANGE,
        "today"
      )
      expectFormattedCountdown(countdown, { formatted: "5.5 hours" })
    })

    test("within 5 hours and 14 minutes, returns 5 hours", () => {
      const countdown = eventCountdown(
        dayjs.duration(5, "hours").add(14, "minute").asSeconds(),
        BASE_TEST_DATE_RANGE,
        "today"
      )
      expectFormattedCountdown(countdown, { formatted: "5 hours" })
    })

    test("starts today, but in more than 6 hours, returns today", () => {
      const countdown = eventCountdown(
        dayjs.duration(8.5, "hours").asSeconds(),
        BASE_TEST_DATE_RANGE,
        "today"
      )
      expectFormattedCountdown(countdown, { todayOrTomorrow: "Today" })
    })

    test("starts tomorrow, returns tomorrow", () => {
      const countdown = eventCountdown(
        dayjs.duration(16, "hours").asSeconds(),
        BASE_TEST_DATE_RANGE,
        "tomorrow"
      )
      expectFormattedCountdown(countdown, { todayOrTomorrow: "Tomorrow" })
    })

    test("starts in 2 days, returns 2 days", () => {
      const countdown = eventCountdown(
        dayjs.duration(2, "days").asSeconds(),
        BASE_TEST_DATE_RANGE,
        null
      )
      expectFormattedCountdown(countdown, { formatted: "2 days" })
    })

    test("starts in 1 week, returns a week", () => {
      const countdown = eventCountdown(
        dayjs.duration(1, "week").asSeconds(),
        BASE_TEST_DATE_RANGE,
        null
      )
      expectFormattedCountdown(countdown, { formatted: "1 week" })
    })

    test("starts in 2 weeks, returns 2 weeks", () => {
      const countdown = eventCountdown(
        dayjs.duration(2, "weeks").asSeconds(),
        BASE_TEST_DATE_RANGE,
        null
      )
      expectFormattedCountdown(countdown, { formatted: "2 weeks" })
    })

    test("starts in 1 month, returns a month", () => {
      const countdown = eventCountdown(
        dayjs.duration(1, "month").asSeconds(),
        BASE_TEST_DATE_RANGE,
        null
      )
      expectFormattedCountdown(countdown, { formatted: "1 month" })
    })

    test("starts in 2 months, returns 2 months", () => {
      const countdown = eventCountdown(
        dayjs.duration(2, "months").asSeconds(),
        BASE_TEST_DATE_RANGE,
        null
      )
      expectFormattedCountdown(countdown, { formatted: "2 months" })
    })

    test("starts in 14 months, returns a year", () => {
      const countdown = eventCountdown(
        dayjs.duration(14, "months").asSeconds(),
        BASE_TEST_DATE_RANGE,
        null
      )
      expectFormattedCountdown(countdown, { formatted: "1 year" })
    })

    test("starts tomorrow in less than 6 hours, returns a numeric countdown and not tomorrow", () => {
      const countdown = eventCountdown(
        dayjs.duration(5, "hour").asSeconds(),
        BASE_TEST_DATE_RANGE,
        "tomorrow"
      )
      expectFormattedCountdown(countdown, { formatted: "5 hours" })
    })

    test("done type when seconds to start is greater than dateRange", () => {
      const baseDate = new Date()
      const countdown = eventCountdown(
        -dayjs.duration(2, "hours").asSeconds(),
        dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate())!,
        "today"
      )
      expect(countdown.kind).toEqual("done")
    })

    test("ends-in type when seconds to start is negative", () => {
      const baseDate = new Date()
      const countdown = eventCountdown(
        -dayjs.duration(10, "minutes").asSeconds(),
        dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate())!,
        "today"
      )
      expect(countdown.kind).toEqual("ends-in")
    })

    test("starts-in type when seconds to start is positive", () => {
      const baseDate = new Date()
      const countdown = eventCountdown(
        dayjs.duration(10, "minutes").asSeconds(),
        dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate())!,
        "today"
      )
      expect(countdown.kind).toEqual("starts-in")
    })

    test("should display fomo effect when less than 15 minutes until event ending", () => {
      const baseDate = new Date()
      const countdown = eventCountdown(
        -dayjs.duration(50, "minutes").asSeconds(),
        dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate())!,
        "today"
      )
      expect((countdown as any).formatted.shouldDisplayFomoEffect).toEqual(true)
    })

    test("should not display fomo effect when more than 15 minutes until event ending", () => {
      const baseDate = new Date()
      const countdown = eventCountdown(
        -dayjs.duration(40, "minutes").asSeconds(),
        dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate())!,
        "today"
      )
      expect((countdown as any).formatted.shouldDisplayFomoEffect).toEqual(
        false
      )
    })

    test("should display fomo effect when less than 15 minutes until event starting", () => {
      const countdown = eventCountdown(
        dayjs.duration(10, "minutes").asSeconds(),
        BASE_TEST_DATE_RANGE,
        "today"
      )
      expect((countdown as any).formatted.shouldDisplayFomoEffect).toEqual(true)
    })

    test("should not display fomo effect when less than 15 minutes until event starting", () => {
      const countdown = eventCountdown(
        dayjs.duration(20, "minutes").asSeconds(),
        BASE_TEST_DATE_RANGE,
        "today"
      )
      expect((countdown as any).formatted.shouldDisplayFomoEffect).toEqual(
        false
      )
    })

    const expectFormattedCountdown = (
      countdown: EventCountdown,
      expected: Omit<EventFormattedCountdown, "shouldDisplayFomoEffect">
    ) => {
      expect((countdown as any).formatted).toMatchObject(expected)
    }
  })
})
