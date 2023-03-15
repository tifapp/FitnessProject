import { dateRange, FixedDateRange } from "@lib/date"
import { Location, Placemark } from "@lib/location"
import { EventColors } from "./EventColors"

/**
 * Basic details of an event.
 */
export type Event = Readonly<{
  id: string
  title: string
  description?: string
  dateRange: FixedDateRange
  color: EventColors
  coordinates: Location
  placemark?: Placemark
  attendeeCount: number
  shouldHideAfterStartDate: boolean
}>

/**
 * A user (host or attendee) that is part of an event.
 */
export type EventUser = Readonly<{
  id: string
  username: string
}>

/**
 * An event with host information.
 */
export type HostedEvent = Readonly<{
  host: EventUser
  details: Event
  isHostedByUser: boolean
  isUserAttending: boolean
}>

/**
 * Some `Event` objects for testing and UI previewing purposes.
 */
export namespace TestEventItems {
  const testId = "3283284382584"
  const address: Placemark = {
    name: "UCSC Campus",
    country: "United States of America",
    postalCode: "95064",
    street: "High St",
    streetNumber: "1156",
    region: "CA",
    isoCountryCode: "US",
    city: "Santa Cruz"
  }

  export const mockHostedEvent = (start: Date, end: Date) => {
    return {
      host: {
        id: "test-host",
        username: "Matthew Hayes"
      },
      details: {
        id: testId,
        title: "Pickup Basketball",
        dateRange: dateRange(start, end),
        color: EventColors.Red,
        coordinates: { latitude: 36.991585, longitude: -122.058277 },
        placemark: address,
        attendeeCount: 0,
        shouldHideAfterStartDate: true
      },
      isHostedByUser: true,
      isUserAttending: true
    }
  }
}
