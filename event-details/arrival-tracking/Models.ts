import { EventArrivalRegionSchema } from "@shared-models/EventArrivals"
import { z } from "zod"

/**
 * A zod schema for {@link EventArrival}.
 */
export const EventArrivalSchema = EventArrivalRegionSchema.omit({
  eventIds: true,
  isArrived: true
}).extend({
  eventId: z.number()
})

/**
 * A zod schema for an array of {@link EventArrival}.
 */
export const EventArrivalsSchema = z.array(EventArrivalSchema)

/**
 * Event arrivals are sent as notifications when the user enters the area of an event,
 * so that other participants are aware of their arrival.
 *
 * The scheduling/sending of the push notifications is handled server-side.
 */
export type EventArrival = z.infer<typeof EventArrivalSchema>
