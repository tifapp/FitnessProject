import { HexColor } from "@lib/Color"
import { FixedDateRange } from "@lib/Date"
import { createDependencyKey } from "@lib/dependencies"
import { Location } from "@lib/location"

/**
 * A data type which is used to update event information.
 */
export type EditEventInput = {
  readonly title: string
  readonly description?: string
  readonly location: Location
  readonly color: HexColor
  readonly dateRange: FixedDateRange
  readonly shouldHideAfterStartDate: boolean
  readonly radiusMeters: number
}

/**
 * An interface representing all the collection of all of the posts in the app.
 */
export interface Events {
  /**
   * Fetches events with the given ids.
   *
   * @returns a list of events (right now just mocks a bunch of events)
   */
  eventsWithIds: (ids: string[]) => Event[]

  /**
   * Creates a new event.
   */
  createEvent: (input: EditEventInput) => Promise<Event>
}

/**
 * Right now doesn't use GraphQL
 *
 */
export class GraphQLEventItems implements Events {
  eventsWithIds (ids: string[]): Event[] {
    if (ids.length === 0) return []
    const eventsList = []
    const date = new Date()
    date.setHours(date.getHours() + 10)

    for (let i = 0; i < ids.length; i++) {
      const event: Event = {
        id: String(ids[i]),
        userId: "3234324",
        username: "Test Event",
        title: "Title for Event",
        repliesCount: 2,
        writtenByYou: true,
        startTime: date,
        maxOccupancy: 5,
        isAcceptingInvitations: true,
        colorHex: "magenta",
        distance: 0.5
      }
      eventsList.push(event)
    }

    return eventsList
  }

  async createEvent (input: EditEventInput): Promise<Event> {
    throw new Error("TODO")
  }
}

export const eventsDependencyKey = createDependencyKey<Events>()
