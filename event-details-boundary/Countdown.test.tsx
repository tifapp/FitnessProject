import { fakeTimers, timeTravel } from "@test-helpers/Timers"
import { act } from "react-test-renderer"
import { dateRange } from "TiFShared/domain-models/FixedDateRange"
import { dayjs } from "TiFShared/lib/Dayjs"
import { eventCountdown } from "./Countdown"

describe("EventDetailsCountdown tests", () => {
  describe("EventCountdown tests", () => {
    fakeTimers()

    const BASE_TEST_DATE_RANGE = dateRange(
      new Date(),
      dayjs().add(15, "minutes").toDate()
    )!

    test("done type when seconds to start is greater than dateRange", () => {
      const baseDate = new Date()
      act(() => timeTravel(dayjs.duration(3, "hours").asMilliseconds()))
      const countdown = eventCountdown(
        -dayjs.duration(2, "hours").asSeconds(),
        dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate())!
      )
      expect(countdown.kind).toEqual("done")
    })

    test("ends-in type when seconds to start is negative", () => {
      const baseDate = new Date()
      const countdown = eventCountdown(
        -dayjs.duration(10, "minutes").asSeconds(),
        dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate())!
      )
      expect(countdown.kind).toEqual("ends-in")
    })

    test("starts-in type when seconds to start is positive", () => {
      const baseDate = new Date()
      const countdown = eventCountdown(
        dayjs.duration(10, "minutes").asSeconds(),
        dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate())!
      )
      expect(countdown.kind).toEqual("starts-in")
    })

    test("should display fomo effect when less than 15 minutes until event ending", () => {
      const baseDate = new Date()
      const countdown = eventCountdown(
        -dayjs.duration(50, "minutes").asSeconds(),
        dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate())!
      )
      expect((countdown as any).formatted.shouldDisplayFomoEffect).toEqual(true)
    })

    test("should not display fomo effect when more than 15 minutes until event ending", () => {
      const baseDate = new Date()
      const countdown = eventCountdown(
        -dayjs.duration(40, "minutes").asSeconds(),
        dateRange(baseDate, dayjs(baseDate).add(1, "hour").toDate())!
      )
      expect((countdown as any).formatted.shouldDisplayFomoEffect).toEqual(
        false
      )
    })

    test("should display fomo effect when less than 15 minutes until event starting", () => {
      const countdown = eventCountdown(
        dayjs.duration(10, "minutes").asSeconds(),
        BASE_TEST_DATE_RANGE
      )
      expect((countdown as any).formatted.shouldDisplayFomoEffect).toEqual(true)
    })

    test("should not display fomo effect when less than 15 minutes until event starting", () => {
      const countdown = eventCountdown(
        dayjs.duration(20, "minutes").asSeconds(),
        BASE_TEST_DATE_RANGE
      )
      expect((countdown as any).formatted.shouldDisplayFomoEffect).toEqual(
        false
      )
    })
  })
})
