import { EventColorsSchema } from "../../lib/events/EventColors"
import { FixedDateRangeSchema } from "../../lib/date"
import { LocationSchema } from "../../lib/location"
import { z } from "zod"
import { ZodUtils } from "@lib/Zod"

export const EventFormPlacemarkInfoSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional()
})

export type EventFormPlacemarkInfo = ZodUtils.ReadonlyInferred<
  typeof EventFormPlacemarkInfoSchema
>

export const EventFormLocationInfoSchema = z.object({
  coordinates: LocationSchema,
  placemarkInfo: EventFormPlacemarkInfoSchema.optional()
})

export type EventFormLocationInfo = ZodUtils.ReadonlyInferred<
  typeof EventFormLocationInfoSchema
>

export const EventFormValuesSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(75).min(1),
  description: z.string().max(500),
  locationInfo: EventFormLocationInfoSchema.optional(),
  dateRange: FixedDateRangeSchema,
  color: EventColorsSchema,
  shouldHideAfterStartDate: z.boolean(),
  radiusMeters: z.number().nonnegative()
})

/**
 * Values held by an `EventForm`.
 */
export type EventFormValues = ZodUtils.ReadonlyInferred<
  typeof EventFormValuesSchema
>
