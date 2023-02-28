import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import isToday from "dayjs/plugin/isToday"
import isTomorrow from "dayjs/plugin/isTomorrow"

dayjs.extend(duration)
dayjs.extend(isToday)
dayjs.extend(isTomorrow)

export { dayjs }
