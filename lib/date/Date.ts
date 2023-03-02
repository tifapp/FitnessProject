import { dayjs } from "./dayjs"

/**
 * Computes the difference between 2 dates in a variety of units.
 */
export const diffDates = (date1: Date, date2: Date) => {
  const d1 = dayjs(date1)
  const d2 = dayjs(date2)
  return {
    milliseconds: d1.diff(d2, "milliseconds", true),
    seconds: d1.diff(d2, "seconds", true),
    minutes: d1.diff(d2, "minutes", true),
    hours: d1.diff(d2, "hours", true),
    days: d1.diff(d2, "days", true),
    weeks: d1.diff(d2, "weeks", true),
    months: d1.diff(d2, "months", true),
    years: d1.diff(d2, "years", true)
  }
}

/**
 * Adds the designated number of seconds to a date and returns the result.
 */
export const addSecondsToDate = (date: Date, seconds: number) => {
  return dayjs(date).add(seconds, "seconds").toDate()
}
