import { FixedDateRange } from "@lib/date"
import { createDependencyKey } from "@lib/dependencies"
import { Placemark } from "@lib/location"

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
export class GraphQLEvents implements Events {
  eventsWithIds (ids: string[]): Event[] {
    if (ids.length === 0) return []
    const eventsList = []
    const date = new Date()
    const date2 = new Date()
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
        duration: new FixedDateRange(date, date2),
        colorHex: "#843efa",
        coordinates: { latitude: 36.991585, longitude: -122.058277 },
        address
      }
      eventsList.push(event)
    }

    return eventsList
  }
}

/**
 * A dependency key for an `Events` instance.
 */
export const eventsDependencyKey = createDependencyKey<Events>(
  new GraphQLEvents()
)
