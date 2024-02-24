import { EventRegionSchema } from "./Event"
import { z } from "zod"

export const EventArrivalRegionSchema = EventRegionSchema.extend({
  eventIds: z.array(z.number()),
  isArrived: z.boolean()
})

export const EventArrivalRegionsSchema = z.array(EventArrivalRegionSchema)

export type EventArrivalRegion = z.infer<typeof EventArrivalRegionSchema>

export const UpcomingEventArrivalsRegionsSchema = z.object({
  upcomingRegions: EventArrivalRegionsSchema
})

export type UpcomingEventArrivalRegions = z.infer<
  typeof UpcomingEventArrivalsRegionsSchema
>
