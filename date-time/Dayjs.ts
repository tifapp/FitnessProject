import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import isToday from "dayjs/plugin/isToday"
import isTomorrow from "dayjs/plugin/isTomorrow"
import isYesterday from "dayjs/plugin/isYesterday"
import isBetween from "dayjs/plugin/isBetween"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"

dayjs.extend(isSameOrAfter)
dayjs.extend(duration)
dayjs.extend(isToday)
dayjs.extend(isTomorrow)
dayjs.extend(isYesterday)
dayjs.extend(isBetween)

/**
 * A more intentful function to return the current date in
 * dayjs terms.
 */
export const now = () => dayjs()

export { dayjs }
