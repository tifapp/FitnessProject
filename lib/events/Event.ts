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
 * Some `UserPost` objects for testing and UI previewing purposes.
 */
export namespace TestEventItems {
  const testId = "3283284382584"
  const testDate = new Date()

  export const mockEvent = (startTime: Date, endTime: Date) => {
    return {
      id: testId,
      userId: "3234324",
      username: "Test Event",
      title: "Title for Event",
      repliesCount: 2,
      writtenByYou: true,
      startTime,
      endTime,
      colorHex: "magenta",
      location: { latitude: 36.991585, longitude: -122.058277 },
      address: "1156 High St, Santa Cruz, CA 95064"
    }
  }
}
