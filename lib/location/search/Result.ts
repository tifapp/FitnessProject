import { Location } from "../Location"

/**
 * A result returned from a {@link LocationSearchClient}.
 */
export type LocationSearchResult = Readonly<{
  name?: string
  formattedAddress?: string
  coordinates: Location
}>
