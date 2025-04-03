import { fakeTimers } from "@test-helpers/Timers"
import { calendarDay } from "./CalendarDay"

describe("CalendarDay tests", () => {
  fakeTimers()

  it("is today when date is on the same day", () => {
    jest.setSystemTime(new Date("2023-10-23T10:32:00Z"))
    const day = calendarDay(new Date("2023-10-23T12:56:10Z"))
    expect(day.isToday).toEqual(true)
  })

  it("is not today when date is not on the same day", () => {
    jest.setSystemTime(new Date("2023-10-23T10:32:00Z"))
    const day = calendarDay(new Date("2023-10-24T12:56:10Z"))
    expect(day.isToday).toEqual(false)
  })

  it("is starting soon when date is within the day range ahead", () => {
    jest.setSystemTime(new Date("2023-10-23T10:32:00Z"))
    const day = calendarDay(new Date("2023-10-24T12:56:10Z"), 7)
    expect(day.isStartingSoon).toEqual(true)
  })

  it("is not starting soon when date is before now", () => {
    jest.setSystemTime(new Date("2023-10-23T10:32:00Z"))
    const day = calendarDay(new Date("2023-10-21T12:56:10Z"), 7)
    expect(day.isStartingSoon).toEqual(false)
  })

  it("is not starting soon when date is outside range", () => {
    jest.setSystemTime(new Date("2023-10-23T10:32:00Z"))
    const day = calendarDay(new Date("2023-10-30T12:56:10Z"), 7)
    expect(day.isStartingSoon).toEqual(false)
  })

  it("is in the future when date not today", () => {
    jest.setSystemTime(new Date("2023-10-23T10:32:00Z"))
    const day = calendarDay(new Date("2023-10-30T12:56:10Z"))
    expect(day.isFuture).toEqual(true)
  })

  it("is not in the future when date today", () => {
    jest.setSystemTime(new Date("2023-10-23T10:32:00Z"))
    const day = calendarDay(new Date("2023-10-23T12:56:10Z"))
    expect(day.isFuture).toEqual(false)
  })

  it("is not in the future when date before today", () => {
    jest.setSystemTime(new Date("2023-10-23T10:32:00Z"))
    const day = calendarDay(new Date("2023-10-21T12:56:10Z"))
    expect(day.isFuture).toEqual(false)
  })

  it("is in the past when date before now", () => {
    jest.setSystemTime(new Date("2023-10-23T10:32:00Z"))
    const day = calendarDay(new Date("2023-10-22T12:56:10Z"))
    expect(day.isPast).toEqual(true)
  })

  it("is not in the past when date after now", () => {
    jest.setSystemTime(new Date("2023-10-23T10:32:00Z"))
    const day = calendarDay(new Date("2023-10-23T12:56:10Z"))
    expect(day.isPast).toEqual(false)
  })
})
