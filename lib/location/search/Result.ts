import { LocationCoordinate2D, LocationCoordinates2DSchema } from "../Location"
import { z } from "zod"

/**
 * A zod schema for a {@link LocationSearchResult}.
 */
export const LocationSearchResultSchema = z.object({
  name: z.string().optional(),
  // TODO: - Address schema?
  formattedAddress: z.string().optional(),
  coordinates: LocationCoordinates2DSchema
})

/**
 * A result returned from a {@link LocationSearchClient}.
 */
export type LocationSearchResult = Readonly<
  z.infer<typeof LocationSearchResultSchema>
>
