import {
  EventArrivalRegion,
  EventArrivalRegionSchema
} from "TiFShared/domain-models/Event"
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

/**
 * Removes arrivals in the given array by whether or not they have the same event id.
 *
 * The latest occurrence of the last arrival is the one that remains.
 */
export const removeDuplicateArrivals = (arrivals: EventArrival[]) => {
  const idToIndexMap = new Map<number, number>()
  arrivals.forEach((arrival, index) => {
    idToIndexMap.set(arrival.eventId, index)
  })
  return arrivals.filter(
    (arrival, index) => idToIndexMap.get(arrival.eventId) === index
  )
}

/**
 * Creates an {@link EventArrivalRegion} using the `eventId` from a given
 * {@link EventArrival} as a single element in the initial array of `eventIds`.
 *
 * @param arrival See {@link EventArrival}
 * @param hasArrived Whether or not to mark the initial state as arrived.
 */
export const arrivalRegion = (
  arrival: EventArrival,
  hasArrived: boolean = false
): EventArrivalRegion => ({
  eventIds: [arrival.eventId],
  coordinate: arrival.coordinate,
  arrivalRadiusMeters: arrival.arrivalRadiusMeters,
  hasArrived
})
