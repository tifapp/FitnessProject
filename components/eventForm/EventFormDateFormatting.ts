import { FixedDateRange } from "@lib/Date"
import { dayjs } from "@lib/dayjs"

export const eventFormFormatDateRange = (dateRange: FixedDateRange) => {
  const start = dayjs(dateRange.startDate)
  const end = dayjs(dateRange.endDate)

  const isStartingToday = dayjs().isSame(start, "day")
  const startsAndEndsOnSameDay = end.isSame(start, "day")

  if (startsAndEndsOnSameDay) {
    return `${
      isStartingToday
        ? `Today ${start.format("ha")}`
        : start.format("MMM D, ha")
    } - ${end.format("ha")}`
  }
  return ""
}
