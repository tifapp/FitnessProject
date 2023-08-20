import { LocationSearchResult } from "@lib/location"

/**
 * Result data for the location search picker.
 */
export type LocationSearchResultsData =
  | {
      status: "loading"
      data: undefined
    }
  | { status: "no-results"; data: [] }
  | { status: "error"; data: undefined }
  | { status: "success"; data: LocationSearchResult[] }
