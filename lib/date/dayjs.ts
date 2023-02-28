import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import isToday from "dayjs/plugin/isToday"
import isTomorrow from "dayjs/plugin/isTomorrow"
import isYesterday from "dayjs/plugin/isYesterday"

dayjs.extend(duration)
dayjs.extend(isToday)
dayjs.extend(isTomorrow)
dayjs.extend(isYesterday)

/**
 * A more intentful function to return the current date in
 * dayjs terms.
 */
export const now = () => dayjs()

export { dayjs }
