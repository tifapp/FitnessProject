import { z } from "zod"
import { LocationCoordinates2DSchema, checkIfCoordsAreEqual } from "./Location"

export const EventRegionSchema = z.object({
  coordinate: LocationCoordinates2DSchema,
  arrivalRadiusMeters: z.number()
})

export type EventRegion = z.infer<typeof EventRegionSchema>

export const areEventRegionsEqual = (r1: EventRegion, r2: EventRegion) => {
  return (
    checkIfCoordsAreEqual(r1.coordinate, r2.coordinate) &&
    r1.arrivalRadiusMeters === r2.arrivalRadiusMeters
  )
}
