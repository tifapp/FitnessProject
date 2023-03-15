import { dateRange, FixedDateRange } from "@lib/date"
import { Location, Placemark } from "@lib/location"
import { EventColors } from "./EventColors"

/**
 * A type representing an event hosted by a user, which is meant for
 * viewing in a feed.
 */
export type Event = {
  readonly id: string
  readonly userId: string
  readonly username: string
  readonly title: string
  readonly description?: string
  readonly writtenByYou: boolean
  readonly dateRange: FixedDateRange
  readonly color: EventColors
  readonly coordinates: Location
  readonly address: Placemark
  readonly isAttending: boolean
}

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

  export const mockEvent = (
    start: Date,
    end: Date,
    eventHost: boolean,
    id?: string
  ): Event => {
    let givenID: string
    if (id) givenID = id
    else givenID = testId
    return {
      id: givenID,
      userId: "3234324",
      username: "Nicolette Antisdel",
      title: "Pickup Basketball",
      description: "This is a test description",
      writtenByYou: eventHost,
      dateRange: dateRange(start, end),
      color: EventColors.Red,
      coordinates: { latitude: 36.991585, longitude: -122.058277 },
      address,
      isAttending: true
    }
  }
}
