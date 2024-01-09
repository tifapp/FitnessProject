import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import isToday from "dayjs/plugin/isToday"
import isTomorrow from "dayjs/plugin/isTomorrow"
import isYesterday from "dayjs/plugin/isYesterday"
import isBetween from "dayjs/plugin/isBetween"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(isSameOrAfter)
dayjs.extend(duration)
dayjs.extend(isToday)
dayjs.extend(isTomorrow)
dayjs.extend(isYesterday)
dayjs.extend(isBetween)
dayjs.extend(relativeTime)

/**
 * A more intentful function to return the current date in dayjs terms.
 */
export const now = () => dayjs()

/**
 * Ceils a {@link duration.Duration} to a given unit and returns a new {@link duration.Duration}
 * represented by the given unit type.
 *
 * ```ts
 * ceilDurationToUnit(dayjs.duration(2.5, "days"), "days") // Returns a duration of 3 days
 * ```
 */
export const ceilDurationToUnit = (
  duration: duration.Duration,
  unit: duration.DurationUnitType
) => {
  return dayjs.duration(Math.ceil(duration.as(unit)), unit)
}

export { dayjs }
