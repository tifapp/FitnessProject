/**
 * A type representing an event hosted by a user, which is meant for
 * viewing in a feed.
 */
export type Event = {
  readonly id: string
  readonly userId: string
  readonly username: string
  readonly profileImage: string
  readonly title: string
  readonly repliesCount: number
  readonly description?: string
  readonly writtenByYou: boolean
  readonly startTime?: Date
  readonly maxOccupancy?: number
  readonly isAcceptingInvitations: boolean
  readonly colorHex: string
  readonly distance: number
  readonly address: string
}

/**
 * Some `UserPost` objects for testing and UI previewing purposes.
 */
export namespace TestEventItems {
  const testId = "3283284382584"
  const testDate = new Date()

  export const mockEvent = (
    time: Date | undefined,
    occupancy: number | undefined,
    hasInvitations: boolean,
    useHours: boolean
  ) => {
    if (useHours) testDate.setHours(testDate.getHours() + 10)

    return {
      id: testId,
      userId: "3234324",
      username: "Test Event",
      profileImage: require("../../assets/icon.png"),
      title: "Title for Event",
      repliesCount: 2,
      writtenByYou: true,
      startTime: time,
      maxOccupancy: occupancy,
      isAcceptingInvitations: hasInvitations,
      colorHex: "magenta",
      distance: 0.5,
      address: "1156 High St, Santa Cruz, CA 95064"
    }
  }
}
