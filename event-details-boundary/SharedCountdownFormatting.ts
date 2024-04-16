import { dayjs } from "TiFShared/lib/Dayjs"

/**
 * Returns a formatted string for detailing the number of seconds before an
 * event.
 *
 * Examples:
 *
 * Exactly 1 week, 1 hour, 1 month, etc. -> A week/month/hour/etc
 *
 * 2 hours, 24 minutes -> 2.5 hours
 *
 * 2 hours, 13 minutes -> 2 hours
 *
 * 2 hours, 44 minutes -> 2.5 hours
 *
 * 2 hours, 45 minutes -> 3 hours
 *
 * 2 weeks, 1 day -> 3 weeks
 *
 * 2 days, 1 hour -> 3 days
 */
export const formattedEventCountdownSeconds = (countdownSeconds: number) => {
  const duration = dayjs.duration(countdownSeconds, "seconds")
  const roundedHours = Math.roundToDenominator(duration.asHours(), 2)
  // NB: Dayjs formats weeks as days (eg. 1 week -> 7-13 days), so this conversion must be done manually.
  if (duration.asWeeks() === 1) {
    return "a week"
  } else if (duration.asWeeks() >= 1 && duration.asMonths() < 1) {
    return `${Math.ceil(duration.asWeeks())} weeks`
  } else if (duration.asDays() >= 1 && duration.asWeeks() < 1) {
    return duration.ext.ceil("days").humanize()
  } else if (duration.asMonths() >= 1) {
    return duration.ext.ceil("months").humanize()
  } else if (roundedHours === 1) {
    return "an hour"
  } else {
    // NB: Dayjs Humanization will cut the decimal, so we need to interpolate manually.
    return `${roundedHours} hours`
  }
}
