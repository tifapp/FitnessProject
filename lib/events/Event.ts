import { dateRange, FixedDateRange } from "@lib/date"
import { Location, Placemark } from "@lib/location"

/**
 * A type representing an event hosted by a user, which is meant for
 * viewing in a feed.
 */
export type Event = {
  readonly id: string
  readonly userId: string
  readonly username: string
  readonly title: string
  readonly repliesCount: number
  readonly description?: string
  readonly writtenByYou: boolean
  readonly duration: FixedDateRange
  readonly colorHex: string
  readonly coordinates: Location
  readonly address: Placemark
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

  export const mockEvent = (start: Date, end: Date): Event => {
    return {
      id: testId,
      userId: "3234324",
      username: "Nicolette Antisdel",
      title: "Pickup Basketball",
      repliesCount: 2,
      writtenByYou: true,
      duration: dateRange(start, end),
      colorHex: "magenta",
      coordinates: { latitude: 36.991585, longitude: -122.058277 },
      address
    }
  }
}
