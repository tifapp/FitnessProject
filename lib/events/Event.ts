import { Location } from "@lib/location"

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
  readonly startTime: Date
  readonly endTime: Date
  readonly colorHex: string
  readonly location: Location
  readonly address: string
}

/**
 * Some `Event` objects for testing and UI previewing purposes.
 */
export namespace TestEventItems {
  const testId = "3283284382584"

  export const mockEvent = (start: Date, end: Date): Event => {
    return {
      id: testId,
      userId: "3234324",
      username: "Nicolette Antisdel",
      title: "Pickup Basketball",
      repliesCount: 2,
      writtenByYou: true,
      startTime: start,
      endTime: end,
      colorHex: "magenta",
      location: { latitude: 36.991585, longitude: -122.058277 },
      address: "1156 High St, Santa Cruz, CA 95064"
    }
  }
}
