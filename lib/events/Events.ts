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
    date.setHours(date.getHours() + 10)
    date.setDate(date.getDate() + 2)
    date2.setHours(date.getHours() + 16)
    date2.setDate(date2.getDate() + 2)

    for (let i = 0; i < ids.length; i++) {
      const event: Event = {
        id: String(ids[i]),
        userId: "3234324",
        username: "Nicolette Antisdel",
        profileImageURL: require("../../assets/icon.png"),
        title: "Pickup Basketball",
        repliesCount: 2,
        writtenByYou: true,
        startTime: date,
        endTime: date2,
        maxOccupancy: 5,
        isAcceptingInvitations: true,
        colorHex: "magenta",
        distance: 0.5,
        address: "1156 High St, Santa Cruz, CA 95064"
      }
      eventsList.push(event)
    }

    return eventsList
  }
}
