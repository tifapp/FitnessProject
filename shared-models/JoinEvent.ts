import { z } from "zod"
import { EventChatTokenRequestSchema } from "./ChatToken"
import { UpcomingEventArrivalsRegionsSchema } from "./EventArrivals"

export const JoinEventResponseSchema =
  UpcomingEventArrivalsRegionsSchema.extend({
    id: z.number(),
    token: EventChatTokenRequestSchema,
    isArrived: z.boolean()
  })

export type JoinEventResponse = z.infer<typeof JoinEventResponseSchema>
