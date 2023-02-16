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
  readonly startTime?: Date
  readonly maxOccupancy?: number
  readonly isAcceptingInvitations: boolean
  readonly colorHex: string
  readonly distance: number
}

/**
 * Some `UserPost` objects for testing and UI previewing purposes.
 */
export namespace TestEventItems {
  const testId = "3283284382584"
  const testDate = new Date()

  export const mockEvent: Event = {
    id: testId,
    userId: "3234324",
    username: "Test Event",
    title: "Title for Event",
    repliesCount: 2,
    writtenByYou: true,
    startTime: testDate,
    maxOccupancy: 5,
    isAcceptingInvitations: true,
    colorHex: "magenta",
    distance: 0.5
  }
}
