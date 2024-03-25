import { EventRegionSchema } from "./Event"
import { z } from "zod"

export const EventArrivalRegionSchema = EventRegionSchema.extend({
  eventIds: z.array(z.number()),
  isArrived: z.boolean()
})

export const EventArrivalRegionsSchema = z.array(EventArrivalRegionSchema)

/**
 * A type containing the same properties as {@link EventRegion}, but also
 * with a status of whether or not the user has arrived at the region.
 *
 * Since multiple events can be at the same region, this type also contains
 * all the ids of the events which share this region.
 */
export type EventArrivalRegion = z.infer<typeof EventArrivalRegionSchema>

export const UpcomingEventArrivalsRegionsSchema = z.object({
  upcomingRegions: EventArrivalRegionsSchema
})

export type UpcomingEventArrivalRegions = z.infer<
  typeof UpcomingEventArrivalsRegionsSchema
>
