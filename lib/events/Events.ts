import { createDependencyKey } from "@lib/dependencies"
import { Image } from "react-native"

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
    const date2 = new Date()
    date.setHours(10, 30)
    date.setDate(date.getDate() + 0)
    date2.setHours(16, 30)
    date2.setDate(date2.getDate() + 2)

    for (let i = 0; i < ids.length; i++) {
      const event: Event = {
        id: i,
        userId: "3234324",
        username: "Nicolette Antisdel",
        title: "Pickup Basketball",
        repliesCount: 2,
        writtenByYou: true,
        startTime: date,
        endTime: date2,
        colorHex: "#843efa",
        location: { latitude: 36.991585, longitude: -122.058277 },
        address: "1156 High St, Santa Cruz, CA 95064"
      }
      eventsList.push(event)
    }

    return eventsList
  }
}

/**
 * A dependency key for a `Events` instance.
 */
export const eventsDependencyKey = createDependencyKey<Events>(() => {
  return new GraphQLEventItems()
})
