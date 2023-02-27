import React from "react"
import { FixedDateRange } from "@lib/Date"
import { dayjs } from "@lib/dayjs"
import { Dayjs } from "dayjs"
import { Text } from "react-native"
import { useEventFormValue } from "./EventForm"

/**
 * A horizontally scrolling toolbar for an event form.
 */
export const EventFormToolbar = () => {
  const dateRange = useEventFormValue("dateRange")
  return <Text>{formatDateRange(dateRange)}</Text>
}

// TODO: - Should this support multiple locales?
const formatDateRange = (dateRange: FixedDateRange) => {
  const start = dayjs(dateRange.startDate)
  const end = dayjs(dateRange.endDate)

  const endDateFormat = end.isSame(start, "day")
    ? formatTime(end)
    : formatDateTime(end)

  const startDateFormat = start.isToday()
    ? `Today ${formatTime(start)}`
    : formatDateTime(start)

  return `${startDateFormat} - ${endDateFormat}`
}

const formatDateTime = (date: Dayjs) => {
  const formattedDate = date.isTomorrow() ? "Tomorrow" : date.format("MMM D,")
  return `${formattedDate} ${formatTime(date)}`
}

const formatTime = (date: Dayjs) => {
  return date.format(date.minute() !== 0 ? "h:mma" : "ha")
}
