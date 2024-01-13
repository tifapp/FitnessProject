import { UserHandle } from "@content-parsing"
import { FixedDateRange } from "@date-time"
import {
  LocationCoordinate2D,
  Placemark,
  placemarkToFormattedAddress
} from "@location"
import { UserToProfileRelationStatus } from "@lib/users"
import * as Clipboard from "expo-clipboard"
import { showLocation } from "react-native-map-link"
import { EventArrival, EventArrivalsTracker } from "./arrival-tracking"

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
 * A user who is attending an event.
 */
export type EventAttendee = {
  id: string
  username: string
  handle: UserHandle
  profileImageURL?: string
  relationStatus: UserToProfileRelationStatus
}

/**
 * The location of an event.
 *
 * Event locations may not have a placemark, this could either be because
 * the event is in the middle of nowhere, or its placemark hasn't been fully
 * decoded for some reason.
 */
export type EventLocation = {
  coordinate: LocationCoordinate2D
  placemark?: Placemark
  arrivalRadiusMeters: number
  isInArrivalTrackingPeriod: boolean
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
  await Clipboard.setStringAsync(text)
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
 * A type representing events that are attended and hosted by users.
 */
export type Event = {
  host: EventAttendee
  id: number
  title: string
  description: string
  dateRange: FixedDateRange
  color: EventColors
  location: EventLocation
  shouldHideAfterStartDate: boolean
  attendeeCount: number
}

/**
 * A type for determining whether or not a user is a host,
 * attendee, or a non-participant of an event.
 */
export type EventUserAttendeeStatus =
  | "hosting"
  | "attending"
  | "not-participating"

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
 * An event type that adds additional data on a specific user's
 * perspective of the event.
 */
export type CurrentUserEvent = Event & {
  userAttendeeStatus: EventUserAttendeeStatus
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
  await Promise.all([
    tracker.removeArrivalsByEventIds(idsToRemove),
    tracker.trackArrivals(arrivalsToTrack)
  ])
}
