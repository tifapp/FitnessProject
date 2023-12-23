import { z } from "zod"
import { LocationCoordinates2DSchema, checkIfCoordsAreEqual } from "./Location"

/**
 * A zod schema for {@link EventRegion}.
 */
export const EventRegionSchema = z.object({
  coordinate: LocationCoordinates2DSchema,
  arrivalRadiusMeters: z.number()
})

/**
 * An event region is defined by the precise location coordinate of an event, and its arrival radius.
 */
export type EventRegion = z.infer<typeof EventRegionSchema>

/**
 * Returns true if 2 {@link EventRegion}s are equal.
 */
export const areEventRegionsEqual = (r1: EventRegion, r2: EventRegion) => {
  return (
    checkIfCoordsAreEqual(r1.coordinate, r2.coordinate) &&
    r1.arrivalRadiusMeters === r2.arrivalRadiusMeters
  )
}
