import { Location } from "../Location"

export type LocationSearchResult = {
  name?: string
  formattedAddress?: string
  coordinates: Location
}
