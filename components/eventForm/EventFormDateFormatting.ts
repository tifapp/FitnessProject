import { FixedDateRange } from "@lib/Date"
import { dayjs } from "@lib/dayjs"
import { Dayjs } from "dayjs"

export const eventFormFormatDateRange = (dateRange: FixedDateRange) => {
  const start = dayjs(dateRange.startDate)
  const end = dayjs(dateRange.endDate)

  const startsAndEndsOnSameDay = end.isSame(start, "day")

  const startTimeFormatted = formatTime(start)
  const endTimeFormatted = formatTime(end)

  const endDateFormat = startsAndEndsOnSameDay
    ? endTimeFormatted
    : `${end.isTomorrow() ? "Tomorrow" : formatDate(end)} ${endTimeFormatted}`

  const startDateFormat = start.isToday()
    ? `Today ${startTimeFormatted}`
    : `${
      start.isTomorrow() ? "Tomorrow" : formatDate(start)
    } ${startTimeFormatted}`
  return `${startDateFormat} - ${endDateFormat}`
}

const formatDate = (date: Dayjs) => date.format("MMM D,")

const formatTime = (date: Dayjs) => {
  return date.format(date.minute() !== 0 ? "h:mma" : "ha")
}
