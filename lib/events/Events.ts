import { FixedDateRangeSchema } from "@lib/date"
import { createDependencyKey } from "@lib/dependencies"
import { LocationSchema } from "@lib/location"
import { EventColorsSchema } from "./EventColors"
import { HostedEvent } from "./Event"
import { z } from "zod"
import { ZodUtils } from "@lib/Zod"

/**
 * A zod schema for {@link SaveEventInput}.
 */
export const SaveEventInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(75).min(1),
  description: z.string().max(500).optional(),
  location: LocationSchema,
  color: EventColorsSchema,
  dateRange: FixedDateRangeSchema,
  shouldHideAfterStartDate: z.boolean(),
  radiusMeters: z.number().nonnegative()
})

/**
 * A data type which is used to update event information.
 */
export type SaveEventInput = ZodUtils.ReadonlyInferred<
  typeof SaveEventInputSchema
>

/**
 * An interface representing all the collection of all of the posts in the app.
 */
export interface Events {
  /**
   * Creates an event if no `id` is present in the {@link SaveEventInput} param,
   * otherwise updates the event with the id.
   */
  saveEvent: (input: SaveEventInput) => Promise<HostedEvent>
}

/**
 * Right now doesn't use GraphQL
 *
 */
export class GraphQLEvents implements Events {
  async saveEvent (input: SaveEventInput): Promise<HostedEvent> {
    throw new Error("TODO")
  }
}

/**
 * A dependency key for an `Events` instance.
 */
export const eventsDependencyKey = createDependencyKey<Events>(
  new GraphQLEvents()
)
