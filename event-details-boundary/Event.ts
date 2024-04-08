import { EventArrival, EventArrivalsTracker } from "@arrival-tracking"
import { CurrentUserEvent } from "@shared-models/Event"
import { dayjs } from "TiFShared/lib/Dayjs"
import { isAttendingEvent } from "TiFShared/domain-models/Event"

/**
 * A type for the color value for an event.
 */
export enum EventColors {
  Red = "#EF6351",
  Purple = "#CB9CF2",
  Blue = "#88BDEA",
  Green = "#72B01D",
  Pink = "#F7B2BD",
  Orange = "#F4845F",
  Yellow = "#F6BD60"
}

/**
 * Adds or removes events in the given arrival tracker depending on whether or not the user
 * is attending the event, and if the event is allowed to be tracked (ie. it starts soon).
 */
export const updateEventsInArrivalsTracker = async (
  events: Pick<CurrentUserEvent, "id" | "location" | "userAttendeeStatus">[],
  tracker: EventArrivalsTracker
) => {
  const [idsToRemove, arrivalsToTrack] = [
    new Set<number>(),
    [] as EventArrival[]
  ]
  for (const event of events) {
    const isAttending = isAttendingEvent(event.userAttendeeStatus)
    if (isAttending && event.location.isInArrivalTrackingPeriod) {
      arrivalsToTrack.push({
        eventId: event.id,
        coordinate: event.location.coordinate,
        arrivalRadiusMeters: event.location.arrivalRadiusMeters
      })
    } else {
      idsToRemove.add(event.id)
    }
  }
  // TODO: Why doesn't Promise.all work here?
  await tracker.removeArrivalsByEventIds(idsToRemove)
  await tracker.trackArrivals(arrivalsToTrack)
}

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
export const humanizeEventCountdownSeconds = (countdownSeconds: number) => {
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
