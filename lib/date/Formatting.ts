import { Dayjs } from "dayjs"
import { FixedDateRange } from "./DateRange"
import { dayjs, now } from "./dayjs"

/**
 * Formats a date range in a UI friendly way.
 */
export const formatDateRange = (dateRange: FixedDateRange) => {
  // TODO: - Should this support multiple locales?
  const start = dayjs(dateRange.startDate)
  const end = dayjs(dateRange.endDate)

  const startDateFormat = formatFromBasis(now(), start)
  const endDateFormat = start.isSame(end, "day")
    ? end.format(timeFormat(end))
    : formatFromBasis(start, end)
  return `${startDateFormat} - ${endDateFormat}`
}

const formatFromBasis = (basis: Dayjs, date: Dayjs) => {
  const formattedTime = date.format(timeFormat(date))
  if (date.isToday()) return `Today ${formattedTime}`
  if (date.isYesterday()) return `Yesterday ${formattedTime}`
  if (date.isTomorrow()) return `Tomorrow ${formattedTime}`
  const yearFormat = !date.isSame(basis, "year") ? " YYYY" : ""
  return date.format(`MMM D${yearFormat}, `) + formattedTime
}

const timeFormat = (date: Dayjs) => {
  return date.minute() !== 0 ? "h:mma" : "ha"
}
