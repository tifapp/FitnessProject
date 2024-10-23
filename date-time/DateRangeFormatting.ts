import { Dayjs } from "dayjs"
import { FixedDateRange } from "TiFShared/domain-models/FixedDateRange"
import { dayjs, now } from "TiFShared/lib/Dayjs"
import { Extension, protoypeExtension } from "TiFShared/lib/Extend"

const extensions = {
  formatted: (range: FixedDateRange) => {
    // TODO: - Should this support multiple locales?
    const start = dayjs(range.startDateTime)
    const end = dayjs(range.endDateTime)

    const startDateFormat = formatFromBasis(now(), start)
    if (start.isSame(end, "minute")) return startDateFormat

    const endDateFormat = start.isSame(end, "day")
      ? formatTime(end)
      : formatFromBasis(start, end)
    return `${startDateFormat} - ${endDateFormat}`
  },
  formattedStartTime: (range: FixedDateRange) => {
    const start = dayjs(range.startDateTime)
    return start.format("h:mm A")
  },
  formattedDate: (_: FixedDateRange, basis: Dayjs, date: Dayjs) => {
    return formatDate(basis, date)
  }
}

export interface ExtendedFixedDateRange
  extends Extension<FixedDateRange, typeof extensions> {}

declare module "TiFShared/domain-models/FixedDateRange" {
  export interface FixedDateRange {
    get ext(): ExtendedFixedDateRange
  }
}

protoypeExtension(FixedDateRange, extensions)

const formatDate = (basis: Dayjs, date: Dayjs) => {
  const current = now()
  if (date.isToday()) return "Today"
  if (date.isYesterday()) return "Yesterday"
  if (date.isTomorrow()) return "Tomorrow"
  if (date.isBetween(current, current.add(7, "days"), "days")) {
    return date.format("ddd")
  }
  const yearFormat = !date.isSame(basis, "year") ? " YYYY" : ""
  return date.format(`ddd, MMM D${yearFormat}`)
}

const formatFromBasis = (basis: Dayjs, date: Dayjs) => {
  const formattedTime = formatTime(date)
  const current = now()
  if (date.isToday()) return `Today ${formattedTime}`
  if (date.isYesterday()) return `Yesterday ${formattedTime}`
  if (date.isTomorrow()) return `Tomorrow ${formattedTime}`
  if (date.isBetween(current, current.add(7, "days"), "days")) {
    return date.format("ddd") + ` ${formattedTime}`
  }
  const yearFormat = !date.isSame(basis, "year") ? " YYYY" : ""
  return date.format(`MMM D${yearFormat}, `) + formattedTime
}

const formatTime = (date: Dayjs) => {
  return date.format(date.minute() !== 0 ? "h:mma" : "ha")
}
