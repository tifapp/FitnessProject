import { LocationCoordinates2DSchema } from "./Location"
import { z } from "zod"

export const EventArrivalsOperationResultSchema = z.union([
  z.object({
    eventId: z.number(),
    status: z.union([z.literal("success"), z.literal("remove-from-tracking")])
  }),
  z.object({
    eventId: z.number(),
    status: z.literal("outdated-coordinate"),
    updatedCoordinate: LocationCoordinates2DSchema
  })
])

/**
 * The result of trying to post an arrival or departure from an event.
 */
export type EventArrivalOperationResult = z.infer<
  typeof EventArrivalsOperationResultSchema
>
