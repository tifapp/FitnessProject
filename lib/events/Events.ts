import { FixedDateRange } from "@lib/date"
import { createDependencyKey } from "@lib/dependencies"
import { Location } from "@lib/location"
import { EventColors } from "./EventColors"
import { Event } from "./Event"

/**
 * A data type which is used to update event information.
 */
export type SaveEventInput = {
  readonly id?: string
  readonly title: string
  readonly description?: string
  readonly location: Location
  readonly color: EventColors
  readonly dateRange: FixedDateRange
  readonly shouldHideAfterStartDate: boolean
  readonly radiusMeters: number
}

/**
 * An interface representing all the collection of all of the posts in the app.
 */
export interface Events {
  /**
   * Creates an event if no `id` is present in the {@link SaveEventInput} param,
   * otherwise updates the event with the id.
   */
  saveEvent: (input: SaveEventInput) => Promise<Event>
}

/**
 * Right now doesn't use GraphQL
 *
 */
export class GraphQLEvents implements Events {
  async saveEvent (input: SaveEventInput): Promise<Event> {
    throw new Error("TODO")
  }
}

/**
 * A dependency key for an `Events` instance.
 */
export const eventsDependencyKey = createDependencyKey<Events>(
  new GraphQLEvents()
)
