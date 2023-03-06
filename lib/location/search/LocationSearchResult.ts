import { Location } from "../Location"

/**
 * A result returned by location search services.
 */
export type LocationSearchResult = {
  name?: string
  formattedAddress?: string
  milesAwayFromUser?: number
  coordinates: Location
  isInSearchHistory: boolean
}
