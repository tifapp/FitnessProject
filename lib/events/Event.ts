export type Event = {
  readonly id: string
  readonly userId: string
  readonly title: string
  readonly repliesCount: number
  readonly description?: string
  readonly writtenByYou: boolean
  readonly startTime?: Date
  readonly maxOccupancy?: number
  readonly hasInvitations: boolean
  readonly color: string
  readonly distance: number
}
