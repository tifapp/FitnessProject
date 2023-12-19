import { LocationCoordinate2D, LocationCoordinates2DSchema } from "./Location"
import { z } from "zod"

/**
 * A zod schema for {@link EventArrival}.
 */
export const EventArrivalSchema = z.object({
  eventId: z.number(),
  coordinate: LocationCoordinates2DSchema,
  arrivalRadiusMeters: z.number()
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

export type EventArrivalsOperationLocation = {
  coordinate: LocationCoordinate2D
  eventIds: number[]
}

/**
 * The result of trying to post an arrival or departure from an event.
 */
export type EventArrivalOperationResult = {
  eventId: number
} & (
  | { status: "success" | "remove-from-tracking" }
  | { status: "outdated-coordinate"; updatedCoordinate: LocationCoordinate2D }
)
