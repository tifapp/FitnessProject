import dayjs from "dayjs"

/**
 * Computes the duration between 2 dates in a variety of units.
 */
export const diffDates = (date1: Date, date2: Date) => {
  const d1 = dayjs(date1)
  const d2 = dayjs(date2)
  return {
    millis: d1.diff(d2, "milliseconds", true),
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

/**
 * A data type to deal with a date range that has a known start and end date.
 *
 * When either the start date is set after the end date or vice versa, the other date
 * is fixed to the correct position using the previous interval between the 2 dates:
 *
 * ```ts
 * // Makes endDate "new Date(3)"" because the previous interval was 1 second
 * const range = new MinMaxDateRange(new Date(0), new Date(1)).setStartDate(new Date(2))
 * ```
 *
 * If the intial start date and end date are incompatible with each other, the initial
 * end date is fixed around the start date with the same means as before:
 *
 * ```ts
 * // Makes endDate "new Date(2)"" because the interval was 1 second
 * const range = new MinMaxDateRange(new Date(1), new Date(0))
 * ```
 */
export class MinMaxDateRange {
  readonly startDate: Date
  readonly endDate: Date

  constructor (startDate: Date, endDate: Date) {
    this.startDate = startDate
    this.endDate = endDate

    if (startDate > endDate) {
      this.endDate = this.moveStartDate(startDate).endDate
    }
  }

  /**
   * Sets the start date of this range adjusting the end date accordingly.
   */
  moveStartDate (date: Date) {
    const { seconds } = diffDates(date, this.endDate)
    if (date > this.endDate) {
      return new MinMaxDateRange(date, addSecondsToDate(date, seconds))
    }
    return new MinMaxDateRange(date, this.endDate)
  }

  /**
   * Sets the start date of this range adjusting the start date accordingly.
   */
  moveEndDate (date: Date) {
    const { seconds } = diffDates(date, this.startDate)
    if (date < this.startDate) {
      return new MinMaxDateRange(addSecondsToDate(date, seconds), date)
    }
    return new MinMaxDateRange(this.startDate, date)
  }
}
