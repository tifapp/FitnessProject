import { format } from "date-fns"

/**
 * Calculates the days between 2 dates and returns either a string or a string representation of a date
 *
 * @param eventDate First date
 * @param date2 Second date
 * @returns String representation of amount of days until event
 */

export const daysBeforeEvent = (eventDate: Date, date: Date) => {
  let dateString = ""
  const eventCopy = new Date(eventDate)
  const dateCopy = new Date(date)
  const oneDay = 24 * 60 * 60 * 1000
  // Set time to midnight in order to accurately count number of days between
  eventCopy.setHours(0, 0, 0)
  dateCopy.setHours(0, 0, 0)

  const diffDays = Math.round(
    Math.abs((eventCopy.getTime() - dateCopy.getTime()) / oneDay)
  )

  if (diffDays < 1) {
    dateString = "Today,"
  } else if (diffDays == 1) {
    dateString = "Tomorrow,"
  } else if (diffDays < 7) {
    dateString = format(eventCopy, "EEEE,")
  } else {
    dateString = format(eventCopy, "LLL io,")
  }

  return dateString
}

/**
 *
 * @param startDate Date object containing the start time
 * @param endDate Date object containing the end time
 * @returns String showing the time interval of the event
 */
export const displayTimeOfEvent = (startDate: Date, endDate: Date) => {
  const startTime = format(startDate, "h:mmaaa")
  const endTime = format(endDate, "h:mmaaa")
  return `${startTime} - ${endTime}`
}
