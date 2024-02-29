import { placemarkToFormattedAddress } from "@location"
import { setStringAsync as expoSetClipboardStringAsync } from "expo-clipboard"
import { showLocation } from "react-native-map-link"
import { EventArrival, EventArrivalsTracker } from "./arrival-tracking"
import {
  EventLocation,
  EventUserAttendeeStatus,
  CurrentUserEvent
} from "@shared-models/Event"
import { ceilDurationToUnit, dayjs } from "@date-time"
import { MathUtils } from "@lib/utils/Math"

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

export type EventLocationCoordinatePlacemark = Pick<
  EventLocation,
  "coordinate" | "placemark"
>

/**
 * Copies an event location to the clipboard.
 *
 * If the event has no formattable placemark, the coordinates are formatted
 * and copied to the clipboard instead of the formatted address of the placemark.
 */
export const copyEventLocationToClipboard = (
  location: EventLocationCoordinatePlacemark,
  setClipboardText: (text: string) => Promise<void> = expoCopyTextToClipboard
) => setClipboardText(formatEventLocation(location))

const expoCopyTextToClipboard = async (text: string) => {
  await expoSetClipboardStringAsync(text)
}

const formatEventLocation = (location: EventLocationCoordinatePlacemark) => {
  const formattedLocationCoordinate = `${location.coordinate.latitude}, ${location.coordinate.longitude}`
  if (!location.placemark) return formattedLocationCoordinate
  const formattedPlacemark = placemarkToFormattedAddress(location.placemark)
  return formattedPlacemark ?? formattedLocationCoordinate
}

/**
 * Opens the event location in the user's preffered maps app.
 *
 * @param location the location to open in maps.
 * @param directionsMode the mehtod of how to link specific directions to the location.
 */
export const openEventLocationInMaps = (
  location: EventLocationCoordinatePlacemark,
  directionsMode?: "car" | "walk" | "bike" | "public-transport"
) => {
  showLocation({
    ...location.coordinate,
    title: location.placemark
      ? placemarkToFormattedAddress(location.placemark)
      : undefined,
    directionsMode
  })
}

/**
 * Returns true if the status indicates that the user is hosting the event.
 */
export const isHostingEvent = (attendeeStatus: EventUserAttendeeStatus) => {
  return attendeeStatus === "hosting"
}

/**
 * Returns true if the status indicates that the user is either hosting or
 * attending the event.
 */
export const isAttendingEvent = (attendeeStatus: EventUserAttendeeStatus) => {
  return attendeeStatus !== "not-participating"
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

export const humanizeEventCountdownSeconds = (countdownSeconds: number) => {
  const duration = dayjs.duration(countdownSeconds, "seconds")
  const roundedHours = MathUtils.roundToDenominator(duration.asHours(), 2)
  // NB: Dayjs formats weeks as days (eg. 1 week -> 7-13 days), so this conversion must be done manually.
  if (duration.asWeeks() === 1) {
    return "a week"
  } else if (duration.asWeeks() >= 1 && duration.asMonths() < 1) {
    return `${Math.ceil(duration.asWeeks())} weeks`
  } else if (duration.asDays() >= 1 && duration.asWeeks() < 1) {
    return ceilDurationToUnit(duration, "days").humanize()
  } else if (duration.asMonths() >= 1) {
    return ceilDurationToUnit(duration, "months").humanize()
  } else if (roundedHours === 1) {
    return "an hour"
  } else {
    // NB: Dayjs Humanization will cut the decimal, so we need to interpolate manually.
    return `${roundedHours} hours`
  }
}
